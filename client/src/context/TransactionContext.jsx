import React, {useEffect, useState} from 'react'
import { ethers } from 'ethers'
import {contractABI, contractAddress} from '../util/constants'
import { AiFillWindows } from 'react-icons/ai';

// pass the value to all children -> val inside () = default value
export const TransactionContext = React.createContext();

// = window.ethereum (eth window object = metamask)
const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)

    return transactionContract
}

// like a global variable which can be used by all its children
export const TransactionProvider = ({children}) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = useState(false)
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}))
    } 

    const getAllTransactions = async () => {
        try {
          if (ethereum) {
            const transactionsContract = getEthereumContract();
    
            const availableTransactions = await transactionsContract.getAllTransactions();
    
            const structuredTransactions = availableTransactions.map((transaction) => ({
              addressTo: transaction.receiver,
              addressFrom: transaction.sender,
              timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
              message: transaction.message,
              keyword: transaction.keyword,
              amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
    
            console.log(structuredTransactions);
    
            setTransactions(structuredTransactions);

          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }
      };

    const checkIfWalletsIsConnected = async () => {
        try{

            if (!ethereum) return alert("Please install metamask")
            
            const accounts = await ethereum.request({method: 'eth_accounts'});
            
            if(accounts.length){
                setCurrentAccount(accounts[0])
                getAllTransactions()
            }else {
                console.log('No accounts found')
            }
        } catch(error){
            console.log(error);

            throw new Error("No ethereum object.")
        }
            
    }

    const checkIfTransactionsExist = async() => { 
        try {
            const transactionContract = getEthereumContract()
            const transactionCount = await transactionContract.getTransactionCount()

            window.localStorage.setItem('transactionCount', transactionCount)
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {
        try{
            if (!ethereum) return alert("Please install metamask")

            const accounts = await ethereum.request({method: 'eth_requestAccounts'});

            setCurrentAccount(accounts[0])

        }catch(error){
            console.log(error);

            throw new Error("No ethereum object.")

        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")

            const {addressTo, amount, keyword, message} = formData;
            const transactionContract = getEthereumContract()
            const parsedAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208",
                    value: parsedAmount._hex,

                }]
            })

           const transactionHash =  await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

           setIsLoading(true);
           await transactionHash.wait()
           setIsLoading(false);

           const transactionCount = await transactionContract.getTransactionCount()
           setTransactionCount(transactionCount.toNumber())



        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletsIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        // key = value -> provide key only
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading }}>
            {children} 
        </TransactionContext.Provider>
    )
}

