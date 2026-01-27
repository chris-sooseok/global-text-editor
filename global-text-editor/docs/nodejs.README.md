# V8 and Node.js runtime environment

`JavaScript` was too slow for modern web apps before V8 was invented. Then, V8's key invention __Just-In-Time(JIT)__ compilation of `JavaScript`, built in 2008 by Google, to native machine code has completely changed the game, and `JS `sunddenly became fast enough for serious applications.

Node.js, created in 2009, brings forward an idea that *"If `JS` is fast enough now, it can be used for server-side operations"*. Thus, Node.js took V8 and wrapped with:
- OS access (files, network, processes)
- An event loop for async I/O

V8 compiler/engine mechanism:
- Parses JavaScript
- Compiles JS -> machine code (JIT)
- Optimize and re-optimize while running
- Manages memory (garbage collection)
- Executes JS fast
![](assets/17665905441767.png)

Thus, V8 makes `JS` a JIT-compiled language. However, as mentioned above, V8 itself can't run system operations to provide server-side services on its own, such as:
- reading files
- opening sockets
- listening on ports 
- spawning processes
- schedule async I/O

Thus, Node.js provides a *runtime environment* that enables JavaScript running fast enough in V8 to utilize system operations to perform server-side tasks.

## What makes Node.js efficient and performant server-side runtime environment?

### Asynchronous and Event-Driven Architecture
Node.js employs an __asynchronous__, non-blocking architecture that allows multiple operations to execute concurrently. This design ensures that the server can handle numerous requests without waiting for any single operation to complete, making it highly efficient and responsive.
Then, Node.js uses an event-driven programming model. This means that the server operates on __events__, responding to user actions or other triggers, which helps in building scalable applications that can handle a large number of simultaneous connections.

### Single-Threaded, but Highly-Scalable Model
Node.js operates on a __single-threaded__ event loop. Unlike traditional servers that spawn multiple threads to handle concurrent connections, thanks to its asynchronous nature. It uses a single thread to handle all requests . This approach minimizes overhead and improves performance.

### Scalability
The __event loop__ handles thousands of connections somultaneously with minimal resource consumption. The __single-threaded model__, combined with __asynchronous I/O operations__, enables developers to build highly scalable applications.

> Event loop in Node.js is managed in C++, but relies on V8 for  `JavaScript` execution

### Fast Performance
Backed-up by V8, Node.js can compile `JavaScript` directly to machine code, making execution extremely fast, which its speed makes Node.js suitable for real-time applications such as chat app, gaming, and collaboration tools.

### Extensions and APIs
Node.js extends V8 with additional features and APIs, such as the ability to handle file systems, networking, and other low-level operations. This allows developers to write server-side code in JavaScript using Node.js's built-in modules and third-party libraries.



