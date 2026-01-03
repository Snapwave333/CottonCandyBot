# System Architecture Diagram

```mermaid
graph TD
    subgraph "Client Side"
        Browser[Web Browser]
        Next[Next.js App]
        Zustand[Zustand Store]
        
        Browser --> Next
        Next --> Zustand
    end
    
    subgraph "Server Side"
        Express[Express API]
        Auth[Auth Middleware]
        Engine[Trading Engine]
        DB[(LowDB JSON)]
        Socket[Socket.IO]
        
        Express --> Auth
        Auth --> Engine
        Engine --> DB
        Socket --> Next
        Engine --> Socket
    end
    
    subgraph "External Services"
        RPC[Solana RPC Node]
        Jito[Jito MEV Block Engine]
        Dex[DEX (Raydium/Jupiter)]
        
        Engine --> RPC
        Engine --> Jito
        RPC --> Dex
    end
    
    Zustand -->|HTTP| Express
    Zustand -->|WS| Socket
```
