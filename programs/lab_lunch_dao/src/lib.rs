use anchor_lang::prelude::*;

declare_id!("9MM4PS44D5KZEVa1ruVuW14B5kbcupm2QXP1Gjfm3V7P");

#[program]
pub mod lab_lunch_dao {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
