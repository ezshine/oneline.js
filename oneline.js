(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Oneline = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class Oneline {
        #peerId = "";
        #visitorCount = 1;
        #peer = null;
        #connections = new Map();
        #eventListeners = [];
        constructor(peerId) {
            this.init(peerId);
    
            return this;
        }
    
        async init(peerId) {
            const { Peer } = await import('https://esm.sh/peerjs@1.5.4?bundle-deps');
            const { v5: uuidv5 } = await import('https://esm.sh/uuid@10.0.0?bundle-deps');
    
            this.#peerId = uuidv5(peerId, uuidv5.URL);
            this.#peer = new Peer();
    
            this.#peer.on('open', (id) => {
                if (id !== this.#peerId) {
                    this.#connectToPeer(this.#peerId);
                }
                this.#updateVisitorCount();
            });
    
            this.#peer.on('connection', (conn) => {
                this.#setupConnection(conn);
            });
    
            this.#peer.on('error', (err) => {
                if (err.type === 'peer-unavailable') {
                    this.#peer.destroy();
                    this.#peer = new Peer(this.#peerId);
                    this.#peer.on('open', () => {
                        this.#updateVisitorCount();
                    });
                    this.#peer.on('connection', (conn) => {
                        this.#setupConnection(conn);
                    });
                } else {
                    console.error('PeerJS error:', err);
                }
            });
    
            window.addEventListener('beforeunload', () => {
                this.#connections.forEach(conn => conn.close());
                this.#peer.destroy();
            });
        }
    
        on(eventName, callback) {
            if (!this.#eventListeners[eventName]) {
                this.#eventListeners[eventName] = [];
            }
            this.#eventListeners[eventName].push(callback);
        }
    
        #triggerEvent(eventName, detail) {
            if (this.#eventListeners[eventName]) {
                this.#eventListeners[eventName].forEach(callback => {
                    callback({ detail });
                });
            }
        }
    
        #updateVisitorCount() {
            this.#triggerEvent("OnelineUpdate", {
                count: this.#visitorCount
            });
        }
    
        #broadcastVisitorCount() {
            this.#connections.forEach(conn => conn.send({ type: 'count', count: this.#visitorCount }));
        }
    
        #setupConnection(conn) {
            conn.on('open', () => {
                this.#connections.set(conn.peer, conn);
                this.#visitorCount = this.#connections.size + 1;
                this.#updateVisitorCount();
                this.#broadcastVisitorCount();
    
                conn.on('data', (data) => {
                    if (data.type === 'count') {
                        this.#visitorCount = Math.max(data.count, this.#visitorCount);
                        this.#updateVisitorCount();
                    }
                });
    
                conn.on('close', () => {
                    this.#connections.delete(conn.peer);
                    this.#visitorCount = this.#connections.size + 1;
                    this.#updateVisitorCount();
                    this.#broadcastVisitorCount();
                });
            });
        }
    
        #connectToPeer(peerId) {
            if (!this.#connections.has(peerId)) {
                const conn = this.#peer.connect(peerId);
                this.#setupConnection(conn);
            }
        }
    }

    return Oneline;
}));
