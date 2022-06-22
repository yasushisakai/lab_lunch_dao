use anchor_lang::prelude::*;
use crate::model::CaterList;

#[derive(Accounts)]
pub struct InitCaterList<'info> {
    #[account(init, payer=owner, space=CaterList::SIZE)]
    list: Account<'info, CaterList>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handler(_ctx:Context<InitCaterList>) -> Result<()>{
    Ok(())
}