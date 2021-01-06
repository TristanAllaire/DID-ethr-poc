import React, { useState } from 'react';
import EthrDID from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

const Home: React.FC = () => {

    const rpcUrl = "https://rinkeby.infura.io/v3/79e9108c93fc4553b4c00f587c6ca160";

    const [keypair, setKeypair] = useState({
        address: "",
        privateKey: ""
    })
    const [claim, setClaim] = useState("");

    function generateKeypair(){
        setKeypair(EthrDID.createKeyPair());
    }

    function importKeypair(e:any){
        e.preventDefault();
        setKeypair({
            address: e.target[0].value,
            privateKey: e.target[1].value
        })
    }

    async function signClaim(e:any){
        e.preventDefault();
        let fields  = [];
        for(let i=0; i<e.target.length-1; i+=2){
            fields.push({
                field: e.target[i].value,
                value: e.target[i+1].value
            })
        }
        let claimFields = fields.reduce(function(k:any, v:any) {
            k[v.field] = v.value;
            return k;
        }, {});
        console.log("Data",claimFields);
        const ethrDid = new EthrDID({
            rpcUrl: rpcUrl,
            ...keypair});
        const verification  = await ethrDid.signJWT({
            claim: claimFields
        },
        1000); //Expiration time seems to be in ms
        console.log(verification);
        setClaim(verification);
    }

    async function verifyClaim(e:any){
        e.preventDefault();
        const providerConfig    = {
            rpcUrl: rpcUrl,
            ...keypair
        };
        const ethrDid = new EthrDID(providerConfig);
        const ethrDidResolver = getResolver(providerConfig);
        const didResolver = new Resolver(ethrDidResolver);
        const jwt = e.target[0].value;
        const verifiedClaim = await ethrDid.verifyJWT(jwt, didResolver);
        console.log(verifiedClaim)
    }

    async function resolveDidDocument(){
        const providerConfig    = {
            rpcUrl: rpcUrl,
            ...keypair
        };
        const ethrDidResolver = getResolver(providerConfig);
        const didResolver = new Resolver(ethrDidResolver);
        const doc = await didResolver.resolve('did:ethr:'+keypair.address);
        console.log(doc);
    }

    return (
        <div className="flex flex-col">
            <h1 className="font-bold text-center text-4xl">
                DID ETHR POC
            </h1>
            <hr/>
            <div className="flex flex-row w-full">
                <div className="flex-1 flex flex-col justify-center items-center">
                    <button className="bg-red-400 text-white w-40" onClick={generateKeypair}>
                        Generate Key Pair
                    </button>
                </div>
                <form className="flex-1 flex flex-col justify-center items-center" onSubmit={importKeypair}>
                    <input type="text" placeholder="eth address" className="w-full"/>
                    <input type="text" placeholder="private key hex" className="w-full"/>
                    <button type="submit" className="bg-red-400 text-white w-40">
                        Import Key Pair
                    </button>
                </form>
            </div>
            <span>
                <b>
                    Address : 
                </b>
                {keypair.address}
            </span>
            <span>
                <b>
                    Private Key : 
                </b>
                {keypair.privateKey}
            </span>
            <hr/>
            <form className="flex-1 flex flex-col justify-center items-center" onSubmit={signClaim}>
                <div className="flex">
                    <input type="text" placeholder="key"/>
                    <input type="text" placeholder="value"/>
                </div>
                <button type="submit" className="bg-red-400 text-white w-40">
                    Sign a Claim
                </button>
            </form>
            <b>
                Claim : 
            </b>
            <span className="w-40">
                {claim}
            </span>
            <hr/>
            <form className="flex-1 flex flex-col justify-center items-center" onSubmit={verifyClaim}>
                <input type="text" placeholder="claim name"/>
                <button type="submit" className="bg-red-400 text-white w-40">
                    Verify a JWT Claim
                </button>
            </form>
            <hr/>
            <button type="button" className="bg-red-400 text-white w-40" onClick={resolveDidDocument}>
                Resolve DID Document
            </button>
        </div>
    );
}

export default Home;