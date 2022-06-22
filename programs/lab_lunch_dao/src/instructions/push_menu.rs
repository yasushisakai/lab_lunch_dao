use anchor_lang::prelude::*;
use crate::model::{CaterItem, MenuItem};

#[derive(Accounts)]
pub struct PushMenu <'info> {
    #[account(mut)]
    cater: Account<'info, CaterItem>,
    #[account(init, payer=owner, space=MenuItem::SIZE)]
    menu: Account<'info, MenuItem>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handle(ctx: Context<PushMenu>, name: &str, foot_print: f32, cost: f32) -> Result<()> {
    require!(name.len() < MenuItem::MAX_MENU_ITEM_NAME_LENGTH, StringTooLong);
    let menu = &mut ctx.accounts.menu;
    menu.name = name.to_string();
    menu.foot_print = foot_print;
    menu.cost = cost;
    let cater = &mut ctx.accounts.cater;
    cater.push_menu(&menu.key())?;
    Ok(())
}