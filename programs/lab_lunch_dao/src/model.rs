use anchor_lang::prelude::*;

#[account]
pub struct Group {
    pub members: Vec<Pubkey>,
    pub seq_no: u64,
    pub quorum: u8,
}

impl Group {
    pub const MAX_GROUP_MEMBERS:usize = 64;
    pub const SIZE: usize = 8 + Group::MAX_GROUP_MEMBERS * 32 + 8 + 1;
}