import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";

export const createUser = async (
    program: Program<LabLunchDao>
): Promise<anchor.web3.Keypair> => {
    const user = anchor.web3.Keypair.generate();
    const con = program.provider.connection;
    const signature = await con.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    const {lastValidBlockHeight, blockhash} = await con.getLatestBlockhash();
    await con.confirmTransaction({lastValidBlockHeight,blockhash,signature})
    return user;
} 

export const initGroup = async (
    program: Program<LabLunchDao>,
    owner: anchor.web3.Keypair): Promise<anchor.web3.Keypair> => {
    
    const key = anchor.web3.Keypair.generate();

    await program.methods.initGroup().accounts({
        group: key.publicKey,
        owner: owner.publicKey,
    }).signers([key, owner])
        .rpc();

    return key;
}
