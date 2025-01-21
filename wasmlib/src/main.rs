use std::io::{self, BufRead};
use std::str::FromStr;
use near_crypto::SecretKey;
use serde_json::json;
use serde::Deserialize;

#[derive(Deserialize)]
struct Input {
    secret_key: String,
    data: Vec<u8>,
}

fn main() {
    // Read input from stdin. Here is an example input: {"secret_key": "ed25519:4ruqLgJ9ckYMNL5o3Hm57SgHX1p3pmN1Dssv29QPfRv2qquU3R7tMQqSmR538uz7466EpepuNNVcMkjmRtoH86SE", "data": [1,2,3,4,5]}
    let stdin = io::stdin();
    let input_line = stdin.lock().lines().next().expect("Failed to read input").expect("Failed to read line");

    // Parse JSON input
    let input: Input = serde_json::from_str(&input_line).expect("Failed to parse JSON");

    // Sign the data
    let secret_key = SecretKey::from_str(&input.secret_key).expect("Invalid secret key");
    let signature = secret_key.sign(&input.data);

    // Output the signature as JSON
    let output = json!({ "signature": signature.to_string() });
    println!("{}", output);
}