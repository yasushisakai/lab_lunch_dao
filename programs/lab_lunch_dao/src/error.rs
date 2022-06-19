use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("only first member can change the group")]
    NotAllowedToUpdateGroup,
    #[msg("group is full")]
    FullGroup,
    #[msg("group members must not overlap")]
    GroupNotUnique,
    #[msg("quorum should be larger than 0 and lower than the total number of members")]
    InvalidQuorum
} 

