# near-api-js-proposal

The purpose of creating a new NEAR API for Javascript and Typescript is to align with the equivalent libraries for [Rust](https://github.com/near/near-api-rs) and [Python](https://github.com/near/near-api-py), with developer experience in focus. The library should have full test coverage from day one, where all usage examples are part of the test suite. It should be usable from NodeJS, and in the web browser, supporting Vanilla JS and frameworks like React or Angular.

# WebAssembly library

As a client library for a blockchain, there will be dependencies on crypto functions, and other functionality that already have robust implementations in Rust. Rather than reimplementing these in JavaScript, the proposal here is to compile these functions to WebAssembly.

In the [wasmlib](./wasmlib/) folder there is a Rust project for a WebAssembly library that provides functionality from NEAR Rust libraries. The library compiles to `wasm32-wasip1` and takes a JSON string as input via `stdin` and prints the output to `stdout`. The provided JSON contains the command and parameters to execute in the WebAssembly library.
