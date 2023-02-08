require('dotenv').config();
const { CosmWasmClient, SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { GasPrice } = require('@cosmjs/stargate');
const fs = require("fs");

async function query() {
    var client = await CosmWasmClient.connect(process.env.STARGAZE_RPC)
    // This is the query you are doing to the contract.
    // If you are unsure of a query, you can check the corresponding GitHub
    // Low hanging fruit: try a random query message and the error will contains which
    // query message you can send
    let queryMsg = {
        params: {}
    }
    let query_output = await client.queryContractSmart(
        // Enter a contract address below
        "stars1fvhcnyddukcqfnt7nlwv3thm5we22lyxyxylr9h77cvgkcn43xfsvgv0pl",
        queryMsg
    );
    console.log(query_output);
}

const config = {
    prefix: 'juno',
    feeDenom: 'ujunox',
    gasPrice: GasPrice.fromString('0.05ujunox'),
};
const upload = async () => {
    const { prefix, gasPrice } = config;
    const wallet_from_mnemonic = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.MNEMONIC,
        { prefix }
    );
    const cosmjs_client = await SigningCosmWasmClient.connectWithSigner(
        process.env.JUNO_TESTNET_RPC,
        wallet_from_mnemonic,
        { prefix, gasPrice }
    );
    const wasm_file = fs.readFileSync("contracts/cw20_base.wasm");
    const txn_outcome = await cosmjs_client.upload(process.env.ADDRESS, wasm_file, "auto");
    console.log(txn_outcome);
}

async function init() {
    const { prefix, gasPrice } = config;
    const wallet_from_mnemonic = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.MNEMONIC,
        { prefix }
    );
    const cosmjs_client = await SigningCosmWasmClient.connectWithSigner(
        process.env.JUNO_TESTNET_RPC,
        wallet_from_mnemonic,
        { prefix, gasPrice }
    );

    let initMsg = {
        name: "Test CW20",
        symbol: "TEST",
        decimals: 6,
        initial_balances: [
            {
                address: process.env.ADDRESS,
                amount: "100000000"
            }
        ],
        mint: {
            minter: process.env.ADDRESS
        }
    };
    const txn_output = await cosmjs_client.instantiate(
        process.env.ADDRESS,
        78,
        initMsg,
        "cw20_contract_name",
        "auto",
        {admin: process.env.ADDRERSS}
    );
    console.log(txn_output);
}

async function execute() {
    const { prefix, gasPrice } = config;
    const wallet_from_mnemonic = await DirectSecp256k1HdWallet.fromMnemonic(
        process.env.MNEMONIC,
        { prefix }
    );
    const cosmjs_client = await SigningCosmWasmClient.connectWithSigner(
        process.env.JUNO_TESTNET_RPC,
        wallet_from_mnemonic,
        { prefix, gasPrice }
    );
    let execMsg = {
        mint: {
            recipient: process.env.ADDRESS,
            amount: "50000000"
        }
    }
    const txn_outcome = await cosmjs_client.execute(
        process.env.ADDRESS,
        process.env.CW20_ADDRESS,
        execMsg,
        "auto"
    );
    console.log(txn_outcome);
}

// query()
// upload()
// init()
// execute()