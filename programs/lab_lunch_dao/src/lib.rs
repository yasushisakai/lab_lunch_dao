mod error;
mod instructions;
mod model;

use anchor_lang::prelude::*;
pub use error::ErrorCode;
use instructions::*;
declare_id!("HtZAJbfvjxWGgMSQh9Aht28sPNX1EC5jsGoeoq9DDqkA");

#[program]
pub mod lab_lunch_dao {
    use super::*;

    pub fn init_group(ctx: Context<InitGroup>) -> Result<()> {
        init_group::handler(ctx)
    }

    pub fn add_members_to_group(
        ctx: Context<AddMembersToGroup>,
        new_members: Vec<Pubkey>,
    ) -> Result<()> {
        add_members_to_group::handler(ctx, new_members)
    }

    pub fn update_quorum(ctx: Context<UpdateQuorum>, new_quorum: u8) -> Result<()> {
        update_group_quorum::handler(ctx, new_quorum)
    }
}
