use anchor_lang::prelude::*;
use crate::model::{CaterItem, CaterList};

#[derive(Accounts)]
pub struct PushCater <'info> {
    #[account(mut)]
    cater_list: Account<'info, CaterList>,
    #[account(init, payer=owner, space=CaterItem::SIZE)]
    cater: Account<'info, CaterItem>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handle(ctx: Context<PushCater>, name: &str) -> Result<()> {
    require!(name.len() < CaterItem::MAX_CATER_NAME_LENGTH, StringTooLong);
    let cater = &mut ctx.accounts.cater;
    cater.name = name.to_string();
    let cater_list = &mut ctx.accounts.cater_list;
    cater_list.push_cater(&cater.key())?;
    Ok(())
}