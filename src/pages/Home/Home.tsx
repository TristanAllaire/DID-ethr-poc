import React, { useState } from 'react';

import EthrDID from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import JSONPretty from 'react-json-pretty';

import 'react-json-pretty/themes/monikai.css';

const Home: React.FC = () => {

    const rpcUrl = "https://rinkeby.infura.io/v3/79e9108c93fc4553b4c00f587c6ca160";

    const [keypair, setKeypair] = useState({
        address: "",
        privateKey: ""
    })
    const [claim, setClaim] = useState("");
    const [operationResult, setOperationResult] = useState("");

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

        const ethrDid = new EthrDID({
            rpcUrl: rpcUrl,
            ...keypair});
        const verification  = await ethrDid.signJWT({
            claim: claimFields
        }, 1000); //Expiration time seems to be in ms
        setClaim(verification);
    }

    async function verifyClaim(e:any){
        e.preventDefault();
        let providerConfig    = {
            rpcUrl: rpcUrl,
            ...keypair
        };
        let ethrDid = new EthrDID(providerConfig);
        let ethrDidResolver = getResolver(providerConfig);
        let didResolver = new Resolver(ethrDidResolver);
        let jwt = e.target[0].value;
        let verifiedClaim = await ethrDid.verifyJWT(jwt, didResolver);
        setOperationResult(JSON.stringify(verifiedClaim));
    }

    async function resolveDidDocument(){
        let providerConfig    = {
            rpcUrl: rpcUrl,
            ...keypair
        };
        let ethrDidResolver = getResolver(providerConfig);
        let didResolver = new Resolver(ethrDidResolver);
        let doc = await didResolver.resolve('did:ethr:'+keypair.address);
        setOperationResult(JSON.stringify(doc));
    }

    return (
        <div className="flex flex-col w-1/2 mx-auto bg-white justify-center">
            <h1 className="font-bold text-center text-4xl">
                DID ETHR POC
            </h1>
            <hr/>
            <h1 className="font-bold text-2xl">
                Ethereum Keypair
            </h1>
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
            {keypair.address!=""&&keypair.privateKey!="" ? (
                <div>
                    <h1 className="font-bold text-2xl">
                        Resolve the DID Document
                    </h1>
                    <div className="flex-1 flex justify-center w-full">
                        <button type="button" className="bg-red-400 text-white w-56" onClick={resolveDidDocument}>
                            Resolve DID Document
                        </button>
                    </div>
                    <hr/>
                    <h1 className="font-bold text-2xl">
                        Sign Verifiable Credential (claim)
                    </h1>
                    <form className="flex-1 flex flex-col justify-center items-center" onSubmit={signClaim}>
                        <div className="flex">
                            <input type="text" placeholder="key" className="border-solid border border-black"/>
                            <input type="text" placeholder="value" className="bborder-solid border border-black"/>
                        </div>
                        <button type="submit" className="bg-red-400 text-white w-40">
                            Sign a Claim
                        </button>
                    </form>
                    <b>
                        Claim JWT Token : 
                    </b>
                    <textarea className="resize-none w-full" rows={5} value={claim} disabled/>
                    <hr/>
                    <h1 className="font-bold text-2xl">
                        Verify Verifiable Claim
                    </h1>
                    <form className="flex-1 flex flex-col justify-center items-center" onSubmit={verifyClaim}>
                        <textarea rows={5} placeholder="Claim JWT Token..." className="resize-none border-solid border border-black w-96"/>
                        <button type="submit" className="bg-red-400 text-white w-40">
                            Verify a JWT Claim
                        </button>
                    </form>
                    <hr/>
                    <h1 className="font-bold text-2xl">
                            Results
                        </h1>
                        <JSONPretty id="json-pretty" data={operationResult}></JSONPretty>
                </div>
            ) : (
                <div className="flex flex-row w-full items-center">
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <button className="bg-red-400 text-white w-40" onClick={generateKeypair}>
                            Generate Key Pair
                        </button>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">
                            OR
                        </h1>
                    </div>
                    <form className="flex-1 flex flex-col justify-center items-center" onSubmit={importKeypair}>
                        <input type="text" placeholder="eth address" className="w-full border-solid border border-black"/>
                        <input type="text" placeholder="private key hex" className="w-full border-solid border border-black"/>
                        <button type="submit" className="bg-red-400 text-white w-40">
                            Import Key Pair
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Home;