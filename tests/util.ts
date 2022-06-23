import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import { CaterInfo } from "./model";

export const newKeyPair = anchor.web3.Keypair.generate;

export const stringToBytes = (str: string) => {
    return anchor.utils.bytes.utf8.encode(str);
}

export const findAddress = async (seeds: (Uint8Array | Buffer)[]): Promise<[anchor.web3.PublicKey, number]> => {
    const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;
    return await anchor.web3.PublicKey.findProgramAddress(seeds, program.programId);
}

export const createUser = async (
    program: Program<LabLunchDao>
): Promise<anchor.web3.Keypair> => {
    const user = newKeyPair();
    const con = program.provider.connection;
    const signature = await con.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    const { lastValidBlockHeight, blockhash } = await con.getLatestBlockhash();
    await con.confirmTransaction({ lastValidBlockHeight, blockhash, signature })
    return user;
}

export const initGroup = async (
    program: Program<LabLunchDao>,
    owner: anchor.web3.Keypair): Promise<anchor.web3.Keypair> => {
    const key = newKeyPair();
    await program.methods.initGroup().accounts({
        group: key.publicKey,
        owner: owner.publicKey,
    }).signers([key, owner])
        .rpc();

    return key;
}

export const batchAddCater = async (
    caterInfo: CaterInfo,
    owner: anchor.web3.Keypair,
    list: anchor.web3.PublicKey,
    group: anchor.web3.PublicKey,
    program: Program<LabLunchDao>) => {
    const [cater, _cBump] = await findAddress([stringToBytes("cater"), list.toBuffer(), stringToBytes(caterInfo.name)]);
    const findAddresses = await Promise.all(caterInfo.menu.map(m => findAddress([stringToBytes("menu"), cater.toBuffer(), stringToBytes(m.name)])));
    const menu = findAddresses.map(([a, _b]) => a)
    await program.methods.pushCater(caterInfo.name).accounts({
        caterList: list,
        cater,
        group: group,
        owner: owner.publicKey
    })
        .signers([owner])
        .rpc();
    const menuFns = caterInfo.menu.map((m, i) => program.methods.pushMenu(m.name, m.footPrint, m.cost).accounts({
        cater,
        menu: menu[i],
        owner: owner.publicKey,
    }).signers([owner]).rpc())
    await Promise.all(menuFns);
    return { cater, menu }
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const aggregateResult = (options: anchor.web3.PublicKey[], votes: number[]) => {

    let voteNumbers = {};

    options.map((k, i) => {
        const count = votes[i];
        if (!voteNumbers[count]) {
            voteNumbers[count] = [];
        }
        voteNumbers[count].push(k.toBase58());
    });

    return Object.entries(voteNumbers).sort((a, b) => a[0] < b[0] ? 1 : -1).map(v => v[1]);
}
