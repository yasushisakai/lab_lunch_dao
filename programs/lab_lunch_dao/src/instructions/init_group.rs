use anchor_lang::prelude::*;
use crate::model::Group;

pub fn handler(ctx: Context<InitGroup>) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let owner = &ctx.accounts.owner;
        group.members.push(owner.key());
        group.quorum = 1;
        Ok(())
}

#[derive(Accounts)]
pub struct InitGroup <'info> {
    #[account(init, payer=owner, space=Group::SIZE)]
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}