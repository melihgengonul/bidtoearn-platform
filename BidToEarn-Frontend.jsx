import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Trophy, Wallet, Eye, EyeOff } from 'lucide-react';

// Kontrat bilgileri
const CONTRACT_ADDRESS = "0xd0299989fD3553A8e9f34fE2040e4fDBE3692823";
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}, {"internalType": "bytes32", "name": "_commitment", "type": "bytes32"}],
    "name": "commitBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "string", "name": "_description", "type": "string"}, {"internalType": "uint256", "name": "_commitDuration", "type": "uint256"}, {"internalType": "uint256", "name": "_revealDuration", "type": "uint256"}, {"internalType": "uint256", "name": "_minBid", "type": "uint256"}],
    "name": "createDailyAsset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}, {"internalType": "uint256", "name": "_nonce", "type": "uint256"}],
    "name": "generateCommitment",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}],
    "name": "getAssetInfo",
    "outputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "description", "type": "string"}, {"internalType": "uint256", "name": "startTime", "type": "uint256"}, {"internalType": "uint256", "name": "commitEndTime", "type": "uint256"}, {"internalType": "uint256", "name": "revealEndTime", "type": "uint256"}, {"internalType": "uint256", "name": "minBid", "type": "uint256"}, {"internalType": "bool", "name": "ended", "type": "bool"}, {"internalType": "address", "name": "winner", "type": "address"}, {"internalType": "uint256", "name": "winningBid", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}, {"internalType": "uint256", "name": "_amount", "type": "uint256"}, {"internalType": "uint256", "name": "_nonce", "type": "uint256"}],
    "name": "revealBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentAssetId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const BidToEarnPlatform = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [nonce, setNonce] = useState('');
  const [isCommitted, setIsCommitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNonce, setShowNonce] = useState(false);

  // Web3 bağlantısı (Basitleştirilmiş)
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        console.log('MetaMask bağlantısı başlatılıyor...');
        
        // Basit hesap isteği
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.log('Hesaplar alındı:', accounts);
        setAccount(accounts[0]);
        
        // Ağ kontrolü (basit)
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Mevcut ağ:', chainId);
        
        if (chainId !== '0xaa36a7') {
          console.log('Sepolia ağına geçiş yapılıyor...');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          } catch (switchError) {
            console.log('Ağ geçiş hatası:', switchError);
            alert('Lütfen MetaMask\'ta manuel olarak Sepolia ağına geçin');
          }
        }
        
        // Mock varlık verisi (kontrat olmadan test için)
        setCurrentAsset({
          name: "Test iPhone 15",
          description: "Günün varlığı: iPhone 15 Pro",
          startTime: Math.floor(Date.now() / 1000) - 3600,
          commitEndTime: Math.floor(Date.now() / 1000) + 3600,
          revealEndTime: Math.floor(Date.now() / 1000) + 7200,
          minBid: 100,
          ended: false,
          winner: '0x0000000000000000000000000000000000000000',
          winningBid: 0
        });
        
        console.log('Bağlantı başarılı!');
        
      } catch (error) {
        console.error('Cüzdan bağlantı hatası:', error);
        alert('Bağlantı hatası: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert('MetaMask yüklü değil! Lütfen MetaMask extension kurunu.');
    }
  };

  // Güncel varlık bilgilerini yükle
  const loadCurrentAsset = async (contractInstance) => {
    try {
      const assetInfo = await contractInstance.methods.getAssetInfo(0).call();
      setCurrentAsset({
        name: assetInfo.name,
        description: assetInfo.description,
        startTime: parseInt(assetInfo.startTime),
        commitEndTime: parseInt(assetInfo.commitEndTime),
        revealEndTime: parseInt(assetInfo.revealEndTime),
        minBid: parseInt(assetInfo.minBid),
        ended: assetInfo.ended,
        winner: assetInfo.winner,
        winningBid: parseInt(assetInfo.winningBid)
      });
    } catch (error) {
      console.error('Varlık bilgisi yüklenirken hata:', error);
    }
  };

  // Gizli teklif ver (Test modu)
  const submitBid = async () => {
    console.log('submitBid fonksiyonu çağrıldı');
    console.log('bidAmount:', bidAmount);
    console.log('nonce:', nonce);
    
    if (!bidAmount || !nonce) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (parseInt(bidAmount) < currentAsset.minBid) {
      alert(`Minimum teklif: ${currentAsset.minBid} wei`);
      return;
    }

    try {
      setLoading(true);
      console.log('Teklif işlemi başlatılıyor...');
      
      // Test modunda 2 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsCommitted(true);
      alert('Gizli teklifiniz başarıyla kaydedildi! 🎉\n\nTest modunda çalışıyor - gerçek blockchain işlemi yapılmadı.');
      
      console.log('Teklif başarıyla kaydedildi (test modu)');
      
    } catch (error) {
      console.error('Teklif verme hatası:', error);
      alert('Teklif verirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // Teklifi açıkla
  const revealBid = async () => {
    if (!contract || !bidAmount || !nonce) {
      alert('Teklif bilgileri eksik!');
      return;
    }

    try {
      setLoading(true);
      await contract.methods.revealBid(0, bidAmount, nonce).send({ from: account });
      alert('Teklifiniz başarıyla açıklandı! 🎯');
    } catch (error) {
      console.error('Reveal hatası:', error);
      alert('Teklif açıklama hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Zaman formatı
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('tr-TR');
  };

  // Mevcut aşamayı belirle
  const getCurrentPhase = () => {
    if (!currentAsset) return 'loading';
    const now = Date.now() / 1000;
    
    if (now < currentAsset.commitEndTime) return 'commit';
    if (now < currentAsset.revealEndTime) return 'reveal';
    return 'ended';
  };

  const phase = getCurrentPhase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 BidToEarn Platform
          </h1>
          <p className="text-xl text-purple-200">
            En Düşük Benzersiz Teklifi Ver, Ödülü Kazan!
          </p>
        </header>

        {/* Wallet Connection */}
        {!account ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <Wallet className="mx-auto mb-4 text-white" size={48} />
                <h2 className="text-2xl font-bold text-white mb-4">Cüzdanınızı Bağlayın</h2>
                <p className="text-purple-200 mb-6">BidToEarn platformuna erişim için MetaMask gerekli</p>
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Bağlanıyor...' : 'MetaMask Bağla'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200">Bağlı Hesap:</p>
                  <p className="text-white font-mono">{account}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-200">Ağ:</p>
                  <p className="text-green-400 font-semibold">Sepolia Testnet</p>
                </div>
              </div>
            </div>

            {/* Current Asset */}
            {currentAsset && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Asset Info */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">📱 Günün Varlığı</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-purple-200">Varlık:</p>
                      <p className="text-white font-semibold text-lg">{currentAsset.name}</p>
                    </div>
                    <div>
                      <p className="text-purple-200">Açıklama:</p>
                      <p className="text-white">{currentAsset.description}</p>
                    </div>
                    <div>
                      <p className="text-purple-200">Minimum Teklif:</p>
                      <p className="text-white font-semibold">{currentAsset.minBid} wei</p>
                    </div>
                    
                    {/* Phase Status */}
                    <div className="mt-6 p-4 rounded-xl bg-white/5">
                      {phase === 'commit' && (
                        <div className="flex items-center text-green-400">
                          <Clock className="mr-2" size={20} />
                          <span className="font-semibold">Teklif Verme Aşaması Aktif</span>
                        </div>
                      )}
                      {phase === 'reveal' && (
                        <div className="flex items-center text-yellow-400">
                          <Eye className="mr-2" size={20} />
                          <span className="font-semibold">Teklif Açıklama Aşaması</span>
                        </div>
                      )}
                      {phase === 'ended' && (
                        <div className="flex items-center text-red-400">
                          <Trophy className="mr-2" size={20} />
                          <span className="font-semibold">Açık Eksiltme Tamamlandı</span>
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-purple-200">
                        <p>Teklif Bitiş: {formatTime(currentAsset.commitEndTime)}</p>
                        <p>Açıklama Bitiş: {formatTime(currentAsset.revealEndTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bidding Interface */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">🎯 Teklif Ver</h2>
                  
                  {phase === 'commit' && !isCommitted && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-purple-200 mb-2">Teklif Miktarı (wei):</label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Minimum: ${currentAsset.minBid}`}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-purple-200 mb-2">
                          Gizli Nonce (Rastgele Sayı):
                          <button
                            onClick={() => setShowNonce(!showNonce)}
                            className="ml-2 text-purple-400 hover:text-purple-300"
                          >
                            {showNonce ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </label>
                        <input
                          type={showNonce ? "text" : "password"}
                          value={nonce}
                          onChange={(e) => setNonce(e.target.value)}
                          placeholder="Örn: 12345"
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <button
                        onClick={submitBid}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? 'Teklif Veriliyor...' : '🔒 Gizli Teklif Ver'}
                      </button>
                    </div>
                  )}
                  
                  {isCommitted && phase === 'commit' && (
                    <div className="text-center">
                      <div className="text-green-400 mb-4">
                        <Trophy size={48} className="mx-auto mb-2" />
                        <p className="font-semibold">Teklifiniz Kaydedildi! ✅</p>
                      </div>
                      <p className="text-purple-200 mb-4">
                        Teklif verme aşaması bittiğinde teklifinizi açıklayabileceksiniz.
                      </p>
                      <div className="bg-white/5 p-4 rounded-xl">
                        <p className="text-sm text-purple-300">
                          ⚠️ Teklif miktarı ve nonce'unuzu unutmayın! Açıklama aşamasında gerekli olacak.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {phase === 'reveal' && (
                    <div className="space-y-4">
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                        <div className="flex items-center text-yellow-400 mb-2">
                          <AlertCircle className="mr-2" size={20} />
                          <span className="font-semibold">Teklif Açıklama Zamanı!</span>
                        </div>
                        <p className="text-sm text-yellow-200">
                          Daha önce verdiğiniz teklif miktarı ve nonce'u girin.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-purple-200 mb-2">Teklif Miktarınız:</label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-purple-200 mb-2">Nonce'unuz:</label>
                        <input
                          type="text"
                          value={nonce}
                          onChange={(e) => setNonce(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      
                      <button
                        onClick={revealBid}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? 'Açıklanıyor...' : '👁️ Teklifi Açıkla'}
                      </button>
                    </div>
                  )}
                  
                  {phase === 'ended' && (
                    <div className="text-center">
                      <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-xl font-bold text-white mb-4">Açık Eksiltme Sonuçları</h3>
                      {currentAsset.winner !== '0x0000000000000000000000000000000000000000' ? (
                        <div>
                          <p className="text-green-400 font-semibold">Kazanan:</p>
                          <p className="text-white font-mono text-sm mb-2">{currentAsset.winner}</p>
                          <p className="text-purple-200">Kazanan Teklif: <span className="text-white font-semibold">{currentAsset.winningBid} wei</span></p>
                        </div>
                      ) : (
                        <p className="text-red-400">Henüz kazanan belirlenmedi</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BidToEarnPlatform;
