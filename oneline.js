import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

class Oneline
{
    #peerId = "";
    #visitorCount = 1;
    #peer = null;
    #connections = new Map();
    #eventListeners = [];
    constructor(peerId){
        this.#peerId = peerId;
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
      
      return this;
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
        this.#triggerEvent("OnelineUpdate",{
                count:this.#visitorCount
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

export default Oneline;

/*
new Oneline("using-a-z-and-0-9-to-make-a-unique-id-for-your-website").on("OnelineUpdate",(e)=>{
  document.querySelector("#visitor-count").innerText = e.detail.count;
})
*/