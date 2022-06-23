import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import { initGroup, createUser, newKeyPair, stringToBytes, findAddress, batchAddCater, sleep, aggregateResult } from "./util";
import caters from "./caters.json";
import { BN } from "bn.js";
import { assert } from "chai";

describe("creates a the two polls in discussion", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;

    let owner: anchor.web3.Keypair;
    let group: anchor.web3.Keypair;
    let memberKeyPairs: anchor.web3.Keypair[] = [];
    let list: anchor.web3.PublicKey;
    let caterMenuList;
    let now;
    let due;
    let topic;

    before(async () => {
        owner = await createUser(program);
        group = await initGroup(program, owner);
        let findList = await findAddress([stringToBytes("cater_list"), group.publicKey.toBuffer()])
        list = findList[0];

        const newMemberNum = 10;

        let richPeople = []
        for (let i = 0; i < newMemberNum; i++) {
            richPeople.push(createUser(program));
        }

        memberKeyPairs = await Promise.all(richPeople);

        await program.methods.addMembersToGroup(memberKeyPairs.map(k => k.publicKey))
            .accounts({ group: group.publicKey, owner: owner.publicKey })
            .signers([owner]).rpc()

        await program.methods.updateQuorum(3).accounts({
            group: group.publicKey,
            owner: owner.publicKey
        }).signers([owner]).rpc();

        await program.methods.initCaterList().accounts({
            list,
            group: group.publicKey,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        caterMenuList = await Promise.all(caters.map(c => batchAddCater(c, owner, list, group.publicKey, program)))
    });

    beforeEach(async () => {
        now = new Date();
        const due_time = new Date(now.getTime() + 1000 * 3);
        due = (due_time.getTime() / 1000).toFixed(); // 10 seconds
        topic = newKeyPair();
    });

    it("creates a cater topic and some votes", async () => {
        await program.methods.createCaterTopic(new BN(due)).accounts({
            topic: topic.publicKey,
            owner: owner.publicKey,
            caterList: list,
            group: group.publicKey,
        }).signers([owner, topic]).rpc();

        let ballots: anchor.web3.PublicKey[] = []

        for (let i = 0; i < 3; i++) {

            let [ballot, _] = await findAddress(
                [
                    stringToBytes("ballot"),
                    memberKeyPairs[i].publicKey.toBuffer(),
                    topic.publicKey.toBuffer()
                ]);

            ballots.push(ballot);

            await program.methods.vote([true, false, false])
                .accounts({
                    ballot,
                    group: group.publicKey,
                    topic: topic.publicKey,
                    voter: memberKeyPairs[i].publicKey
                }).signers([memberKeyPairs[i]]).rpc()
        }

        await sleep(4000);

        const [result, _rBump] = await findAddress([stringToBytes("result"), topic.publicKey.toBuffer()])
        await program.methods.finalizeTopic().accounts({
            topic: topic.publicKey,
            result,
            group: group.publicKey,
            payer: owner.publicKey,
        })
            .signers([owner])
            .remainingAccounts(ballots.map(
                b => ({ pubkey: b, isWritable: false, isSigner: false })))
            .rpc();

        const topicAccount = await program.account.topic.fetch(topic.publicKey);
        assert(topicAccount.finalized);
        const resultAccount = await program.account.finalizedTopic.fetch(result);
        const voteResult = aggregateResult(topicAccount.options, resultAccount.votes as number[]);
        assert.equal(voteResult[0][0], topicAccount.options[0].toBase58());
    });

});