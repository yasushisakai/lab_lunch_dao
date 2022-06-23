import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import assert from 'assert';
import { initGroup, createUser, newKeyPair, stringToBytes, findAddress, batchAddCater } from "./util";
import { CaterInfo } from "./model";

export const caterInfo: CaterInfo = {
    "name": "Fareast Italian",
    "menu": [
        { "name": "pizza", "footPrint": 1.3, "cost": 12 },
        { "name": "sushi", "footPrint": 0.6, "cost": 20 },
        { "name": "pasta", "footPrint": 2.1, "cost": 16 },
    ]
};

describe("caters and menus", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;

    it("inits cater list, a cater and one menu", async () => {
        // const owner = (program.provider as anchor.AnchorProvider).wallet.publicKey;
        const owner = await createUser(program);
        const group = await initGroup(program, owner);
        const [list, listBump] = await findAddress([stringToBytes("cater_list"), group.publicKey.toBuffer()])

        await program.methods.initCaterList().accounts({
            list,
            group: group.publicKey,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        let listAccount = await program.account.caterList.fetch(list);
        assert.equal(listAccount.bump, listBump);

        const caterName = "Fareast Italian";
        const [cater, _cBump] = await findAddress([stringToBytes("cater"), list.toBuffer(), stringToBytes(caterName)]);

        await program.methods.pushCater(caterName).accounts({
            caterList: list,
            cater,
            group: group.publicKey,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc()

        const menuName = "carbonara"
        const [menu, _mBump] = await findAddress([stringToBytes("menu"), cater.toBuffer(), stringToBytes(menuName)]);

        await program.methods.pushMenu(menuName, 1.0, 15.0)
            .accounts({
                cater,
                menu,
                owner: owner.publicKey
            }).signers([owner]).rpc()

    });

    it("batch adds, one cater and it's menus", async () => {
        const owner = await createUser(program);
        const group = await initGroup(program, owner);
        const [list, _lBump] = await findAddress([stringToBytes("cater_list"), group.publicKey.toBuffer()])

        await program.methods.initCaterList().accounts({
            list,
            group: group.publicKey,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        const { cater, menu: _menu } = await batchAddCater(caterInfo, owner, list, group.publicKey, program);

        const caterAccount = await program.account.caterItem.fetch(cater);
        assert.equal(caterAccount.menus.length, 3);

        const menuAccounts = await program.account.menuItem.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: cater.toBase58()
                }
            }
        ]);
        assert.equal(menuAccounts.length, 3);
    });
});
