import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk";

export default async function handler(req, res) {
  // CORS: allow only your site (add www. if you use it)
  res.setHeader("Access-Control-Allow-Origin", "https://coinbridgefoundation.org");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

  try {
    const { address } = req.body || {};
    if (!/^0x[a-fA-F0-9]{40}$/.test(address || "")) {
      return res.status(400).json({ ok:false, error:"Invalid address" });
    }

    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,   // set in Vercel
      network: Network.ETH_SEPOLIA
    });
    const provider = await alchemy.config.getProvider();
    const wallet = new Wallet(process.env.FAUCET_PRIVATE_KEY, provider);

    const tx = await wallet.sendTransaction({
      to: address,
      value: Utils.parseEther("0.05")        // amount to send
    });

    return res.status(200).json({ ok:true, tx: tx.hash });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
