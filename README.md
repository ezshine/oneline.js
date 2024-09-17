# oneline.js

oneline.js is a website real-time online visit statistics tool based on webrtc technology and peer.js.

# how to use

use <script>
```
<script src='https://cdn.jsdelivr.net/gh/ezshine/oneline.js@1.0.0/oneline.js'></script>
```

or esm import
```
import Oneline from 'https://cdn.jsdelivr.net/gh/ezshine/oneline.js@1.0.0/oneline.js'
```

then
```
new Oneline("using-a-z-and-0-9-to-make-a-unique-id-for-your-website").on("OnelineUpdate", (e) => {
    //use e.detail.count for your code
})
```

# How does it work
![Snipaste_2024-09-17_09-56-26](https://github.com/user-attachments/assets/f50104d1-6f78-40be-9b57-ad6ceeef939d)

1. Start Application: The application initializes when the page loads.
2. Is predefined PEER_ID?:
  - If the current Peer is the predefined PEER_ID, it directly creates a Peer object.
  - If not, it attempts to connect to the predefined PEER_ID.
3. Connection attempt:
  - If the connection is successful, it establishes the connection.
  - If the connection fails (predefined Peer doesn't exist), it creates a new Peer object using the predefined PEER_ID.
4. Set up event listeners:
  - For newly created Peer objects, it listens for new connection requests.
  - For each established connection, it sets up the corresponding event handlers.
5. Update and Broadcast:
  - Whenever the connection state changes (new connection established or connection closed), it updates the local visitor count.
  - It broadcasts the new count to all connected Peers.
6. Continuous monitoring:
 - Listens for new connection requests.
 - Listens for count updates from other Peers.
 - Listens for connection closure events.
7. Handle received data:
 - If a count update is received, it compares and updates the local count (takes the maximum value).
 - If a connection closes, it removes that connection and updates the count.
8. Loop:
 - Continuously performs the above process to maintain real-time updates.

# special thanks

- [peer.js](https://peerjs.com/)   (let us easier to use webRTC)
- [claude.ai](https://claude.ai/) (let us easier to coding)

# author's social

| Twitter | Youtube | Wechat | 
| - | - | - |
| [![](https://img.shields.io/twitter/url/https/twitter.com/ezshine.svg?style=social&label=Follow%20%40ezshine)](https://twitter.com/ezshine) | [![YouTube Channel Subscribers](https://img.shields.io/youtube/channel/subscribers/UCNxA8E0jYm1vGTz0otLh4Lg)](https://youtube.com/@ezshine) | [![](https://img.shields.io/badge/-%E5%A4%A7%E5%B8%85%E8%80%81%E7%8C%BF-07c160?logo=wechat&logoColor=white&label=公众号)](https://open.weixin.qq.com/qr/code?username=ezfullstack) |
