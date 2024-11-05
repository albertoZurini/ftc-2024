use soroban_sdk::{contract, contractimpl, Address, Env, String};

// Constants for the bonding curve parameters
const INITIAL_PRICE: f64 = 2.0; // Starting price of the token
const INITIAL_RESERVE_BALANCE: f64 = 40.0;
const RESERVE_RATIO: f64 = 0.25;
const ENTRY_TAX_RATE: f64 = 0.22; // 22% entry tax
const EXIT_TAX_RATE: f64 = 0.02;  // 2% exit tax
const TAX_WALLET: Address = Address::new_static("TAX_WALLET_ADDRESS_HERE");

#[contract]
pub struct TokenWithBondingCurve;

#[contractimpl]
impl TokenWithBondingCurve {
    fn initialize(e: Env, admin: Address, decimal: u32, name: String, symbol: String) {
        Token::initialize(e.clone(), admin, decimal, name, symbol);
        
        // Initialize bonding curve parameters
        e.storage().set("current_price", INITIAL_PRICE); // Set initial price
        e.storage().set("total_supply", 80_i128); // Starting supply
        e.storage().set("reserve_balance", INITIAL_RESERVE_BALANCE); // Starting reserve
    }

    fn buy_tokens(e: Env, buyer: Address, amount_in_base_currency: i128) -> i128 {
        let mut current_price = e.storage().get::<_, f64>("current_price").unwrap_or(INITIAL_PRICE);
        let mut total_supply = e.storage().get::<_, i128>("total_supply").unwrap_or(80);
        let mut reserve_balance = e.storage().get::<_, f64>("reserve_balance").unwrap_or(INITIAL_RESERVE_BALANCE);

        // Calculate tax and net deposit
        let deposit_after_tax = amount_in_base_currency as f64 * (1.0 - ENTRY_TAX_RATE);
        let entry_tax = amount_in_base_currency as f64 * ENTRY_TAX_RATE;

        // Send entry tax to the predefined wallet
        // e.transfer_to(TAX_WALLET, entry_tax as i128); // Ensure TAX_WALLET is a valid constant

        // Calculate the number of tokens to mint based on bonding curve math
        let mint_amount = calculate_mint_amount(deposit_after_tax, total_supply as f64, reserve_balance);
        total_supply += mint_amount as i128;

        // Update total supply, reserve balance, and current price
        reserve_balance += deposit_after_tax;
        current_price = calculate_new_price(total_supply as f64, reserve_balance);

        // Update storage
        e.storage().set("current_price", current_price);
        e.storage().set("total_supply", total_supply);
        e.storage().set("reserve_balance", reserve_balance);

        // Mint tokens to the buyer
        Token::mint(e.clone(), buyer, mint_amount as i128);

        mint_amount as i128
    }

    fn sell_tokens(e: Env, seller: Address, tokens_to_sell: i128) -> i128 {
        let mut current_price = e.storage().get::<_, f64>("current_price").unwrap();
        let mut total_supply = e.storage().get::<_, i128>("total_supply").unwrap();
        let mut reserve_balance = e.storage().get::<_, f64>("reserve_balance").unwrap();

        // Calculate reserve return and apply exit tax
        let balance_return = calculate_balance_return(tokens_to_sell as f64, total_supply as f64, reserve_balance);
        let refund_after_tax = balance_return * (1.0 - EXIT_TAX_RATE);
        let exit_tax = balance_return * EXIT_TAX_RATE;

        // Send exit tax to the predefined wallet
        // e.transfer_to(TAX_WALLET, exit_tax as i128);

        // Update total supply and reserve balance
        total_supply -= tokens_to_sell;
        reserve_balance -= refund_after_tax;

        // Update current price after burning
        current_price = calculate_new_price(total_supply as f64, reserve_balance);

        // Update storage
        e.storage().set("current_price", current_price);
        e.storage().set("total_supply", total_supply);
        e.storage().set("reserve_balance", reserve_balance);

        // Burn tokens from the seller's account
        Token::burn(e.clone(), seller, tokens_to_sell);

        refund_after_tax as i128
    }

    fn get_current_price(e: Env) -> f64 {
        e.storage().get::<_, f64>("current_price").unwrap_or(INITIAL_PRICE)
    }
}

// Utility functions
fn calculate_new_price(supply: f64, reserve_balance: f64) -> f64 {
    // New price based on the formula: m * supply ^ n
    reserve_balance / (supply * RESERVE_RATIO)
}

fn calculate_mint_amount(deposit: f64, supply: f64, reserve_balance: f64) -> f64 {
    // Mint amount calculation using the Bancor formula
    supply * ((1.0 + deposit / reserve_balance).powf(RESERVE_RATIO) - 1.0)
}

fn calculate_balance_return(burn_amount: f64, supply: f64, reserve_balance: f64) -> f64 {
    // Balance return calculation using Bancor formula for burns
    reserve_balance * (1.0 - (1.0 - burn_amount / supply).powf(1.0 / RESERVE_RATIO))
}
