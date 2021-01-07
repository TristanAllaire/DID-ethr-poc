import React, { useState } from 'react';

import EthrDID from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import JSONPretty from 'react-json-pretty';

import { EthrStatusRegistry } from 'ethr-status-registry'
import 'react-json-pretty/themes/monikai.css';

const Home: React.FC = () => {

    const rpcUrl    = "https://rinkeby.infura.io/v3/79e9108c93fc4553b4c00f587c6ca160";

    const [issuerKeypair, setIssuerKeypair] = useState({
        address: "",
        privateKey: ""
    })
    const [subjectKeypair, setSubjectKeypair] = useState({
        address: "",
        privateKey: ""
    })
    const [selectedIdentity, setSelectedIdentity] = useState("");

    const [credential, setCredential] = useState("");
    const [operationResult, setOperationResult] = useState("");
    const [credentialStatus, setCredentialStatus] = useState("");

    function generateKeypairs(){
        setIssuerKeypair(EthrDID.createKeyPair());
        setSubjectKeypair(EthrDID.createKeyPair());
    }

    function importKeypairs(e:any){
        e.preventDefault();
        setIssuerKeypair({
            address: e.target[0].value,
            privateKey: e.target[1].value
        });
        setSubjectKeypair({
            address: e.target[2].value,
            privateKey: e.target[3].value
        });
    }

    async function signCredential(e:any){
        e.preventDefault();
        let fields  = [];
        for(let i=1; i<e.target.length-1; i+=2){
            fields.push({
                field: e.target[i].value,
                value: e.target[i+1].value
            })
        }
        let credentialFields = fields.reduce(function(k:any, v:any) {
            k[v.field] = v.value;
            return k;
        }, {});

        let ethrDid = new EthrDID({
            rpcUrl: rpcUrl,
            ...issuerKeypair});
        
        let verification  = await ethrDid.signJWT({
            claim: credentialFields,
            sub: "did:ethr:"+subjectKeypair.address
        }, e.target[0].value * 1000); //Expiration time seems to be in ms
        setCredential(verification);
    }

    async function verifyCredential(e:any){
        e.preventDefault();
        let providerConfig    = {
            rpcUrl: rpcUrl,
            ...subjectKeypair
        };
        let ethrDid = new EthrDID(providerConfig);
        let ethrDidResolver = getResolver(providerConfig);
        let didResolver = new Resolver(ethrDidResolver);
        let jwt = e.target[0].value;
        let verifiedCredential = await ethrDid.verifyJWT(jwt, didResolver);
        setOperationResult(JSON.stringify(verifiedCredential));

        //Vérification du statut d'un contrat
        //La vérification se fera sur le noeud Infura renseigné
        let status = new EthrStatusRegistry({
            infuraProjectId: '79e9108c93fc4553b4c00f587c6ca160'
        })
        let credentialStatus     = await status.checkStatus(jwt, verifiedCredential.doc);
        setCredentialStatus(JSON.stringify(credentialStatus));
    }

    function onSelectIdentity(e:any){
        setSelectedIdentity(e.target.value);
    }

    async function resolveDidDocument(e:any){
        e.preventDefault();

        let providerConfig;
        let selectedKeypair   = selectedIdentity === "issuer" ? issuerKeypair : subjectKeypair;

        providerConfig    = {
            rpcUrl: rpcUrl,
            ...selectedKeypair
        };

        let ethrDidResolver = getResolver(providerConfig);
        let didResolver = new Resolver(ethrDidResolver);
        let doc = await didResolver.resolve('did:ethr:'+selectedKeypair.address);
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
            <h1 className="font-bold text-xl">
                Issuer
            </h1>
            <JSONPretty id="json-pretty" data={issuerKeypair}></JSONPretty>
            <h1 className="font-bold text-xl">
                Subject
            </h1>
            <JSONPretty id="json-pretty" data={subjectKeypair}></JSONPretty>
            <hr/>
            {issuerKeypair.address!=""&&issuerKeypair.privateKey!="" ? (
                <div>
                    <h1 className="font-bold text-2xl">
                        DID Document
                    </h1>
                    <form className="flex-1 flex flex-col justify-center items-center w-full" onSubmit={resolveDidDocument}>
                        <div className="flex" onChange={onSelectIdentity}>
                            <input type="radio" id="issuer" name="keypair" value="issuer"/>
                            <label htmlFor="issuer">Issuer</label>

                            <input type="radio" id="subject" name="keypair" value="subject"/>
                            <label htmlFor="subject">Subject</label>
                        </div>
                        <button type="submit" className="bg-red-400 text-white w-56">
                            Resolve DID Documents
                        </button>
                    </form>
                    <hr/>
                    <h1 className="font-bold text-2xl">
                        Sign Verifiable Credential
                    </h1>
                    <form className="flex-1 flex flex-col justify-center items-center" onSubmit={signCredential}>
                        <input type="number" placeholder="expiration in seconds" className="border-solid border border-black"/>
                        <div className="flex">
                            <input type="text" placeholder="key" className="border-solid border border-black"/>
                            <input type="text" placeholder="value" className="bborder-solid border border-black"/>
                        </div>
                        <button type="submit" className="bg-red-400 text-white w-40">
                            Sign a Credential
                        </button>
                    </form>
                    <b>
                        Credential JWT Token : 
                    </b>
                    <textarea className="resize-none w-full" rows={5} value={credential} disabled/>
                    <hr/>
                    <h1 className="font-bold text-2xl">
                        Verify Verifiable Credential
                    </h1>
                    <form className="flex-1 flex flex-col justify-center items-center" onSubmit={verifyCredential}>
                        <textarea rows={5} placeholder="Credential JWT Token..." className="resize-none border-solid border border-black w-96"/>
                        <button type="submit" className="bg-red-400 text-white w-40">
                            Verify a JWT Credential
                        </button>
                    </form>
                    <hr/>
                    {
                        credentialStatus!=="" && (
                            <>
                                <h1 className="font-bold text-2xl">
                                    Credential Status
                                </h1>
                                <JSONPretty id="json-pretty" data={credentialStatus}></JSONPretty>
                            </>
                        )
                    }
                    <h1 className="font-bold text-2xl">
                        Results
                    </h1>
                    <JSONPretty id="json-pretty" data={operationResult}></JSONPretty>
                </div>
            ) : (
                <div className="flex flex-col w-full items-center">
                    <hr/>
                    <form className="w-full flex flex-col justify-center" onSubmit={importKeypairs}>
                        <label htmlFor="issuer" className="font-bold">Issuer</label>
                        <input type="text" placeholder="eth address" className="w-full border-solid border border-black" id="issuer"/>
                        <input type="text" placeholder="private key hex" className="w-full border-solid border border-black"/>
                        <label htmlFor="subject" className="font-bold">Subject</label>
                        <input type="text" placeholder="eth address" className="w-full border-solid border border-black" id="subject"/>
                        <input type="text" placeholder="private key hex" className="w-full border-solid border border-black"/>
                        <button type="submit" className="bg-red-400 text-white w-40 mx-auto">
                            Import Key Pair
                        </button>
                    </form>
                    <div>
                        <h1 className="font-bold text-xl">
                            OR
                        </h1>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <button className="bg-red-400 text-white w-40" onClick={generateKeypairs}>
                            Generate Keypairs
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;