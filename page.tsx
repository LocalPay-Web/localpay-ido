// Trang web IDO LocalPay (Next.js + Tailwind + Web3 + Contract Thật)
"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import logo from "@/public/logoLPay.png";

const TOKEN_NAME = "LocalPay";
const TOKEN_SYMBOL = "LPAY";
const TOTAL_SUPPLY = "300,000,000";
const TOKEN_PRICE = 0.05; // $0.05/token
const HARD_CAP = 300000 * TOKEN_PRICE;

// Contract thực (đã triển khai)
const SALE_CONTRACT = "0xb9c8b67b6a2309c4fd26408641a15be6d77bab21";
const SALE_ABI = [
  "function buyTokens() payable",
  "function getTokenRate() view returns (uint256)",
  "function tokensSold() view returns (uint256)"
];

export default function IDOPage() {
  const [wallet, setWallet] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [amount, setAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Vui lòng cài đặt MetaMask!");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setWallet(accounts[0]);
    setConnected(true);
  };

  const handleBuy = async () => {
    if (!connected || !amount) return;
    try {
      setTxLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const sale = new ethers.Contract(SALE_CONTRACT, SALE_ABI, signer);

      const valueInEth = parseFloat(amount) / 2000; // Giả sử 1 ETH = $2000
      const tx = await sale.buyTokens({ value: ethers.utils.parseEther(valueInEth.toString()) });
      await tx.wait();
      alert("Mua token thành công!");
    } catch (error) {
      console.error(error);
      alert("Giao dịch thất bại!");
    }
    setTxLoading(false);
  };

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setWallet(window.ethereum.selectedAddress);
      setConnected(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="LPAY Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">LocalPay IDO</h1>
        </div>
        <button
          onClick={connectWallet}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm"
        >
          {connected ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Kết nối ví"}
        </button>
      </header>

      <main className="mt-10 max-w-2xl mx-auto">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Thông tin Token</h2>
          <ul className="space-y-1 text-sm text-gray-300">
            <li><strong>Tên:</strong> {TOKEN_NAME}</li>
            <li><strong>Ký hiệu:</strong> {TOKEN_SYMBOL}</li>
            <li><strong>Tổng cung:</strong> {TOTAL_SUPPLY}</li>
            <li><strong>Giá bán:</strong> ${TOKEN_PRICE.toFixed(2)} / token</li>
            <li><strong>Hard Cap:</strong> ${HARD_CAP.toLocaleString()} USD</li>
          </ul>
        </section>

        <section className="bg-gray-900 p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Mua LPAY</h3>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              placeholder="Số tiền USD muốn mua"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="text-gray-400">USD</span>
          </div>
          <button
            onClick={handleBuy}
            disabled={!connected || !amount || txLoading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full text-sm"
          >
            {txLoading ? "Đang xử lý..." : "Mua Token"}
          </button>
        </section>

        <p className="text-center mt-8 text-xs text-gray-500">
          © 2025 LocalPay. Mọi quyền được bảo lưu.
        </p>
      </main>
    </div>
  );
}
