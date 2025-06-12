# 🎯 BidToEarn Platform

**Blockchain tabanlı en düşük benzersiz teklif açık eksiltme platformu**

![Platform Preview](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-orange)

## 🚀 Proje Özeti

BidToEarn, kullanıcıların günlük varlıklara gizli teklifler verebildiği ve **en düşük benzersiz teklifi** verenin kazandığı blockchain tabanlı bir platformdur.

## ✨ Temel Özellikler

- 🔒 **Gizli Teklif Sistemi** - Commit-Reveal protokolü ile gizlilik
- 🏆 **En Düşük Benzersiz Teklif** - Oyun teorisi tabanlı kazanan belirleme
- 📱 **Modern Web Arayüzü** - React tabanlı responsive tasarım
- 🔗 **MetaMask Entegrasyonu** - Kolay cüzdan bağlantısı
- ⚡ **Real-time Updates** - Canlı açık eksiltme takibi

## 🛠️ Teknoloji Stack

### Backend (Blockchain)
- **Solidity** - Akıllı kontrat geliştirme
- **Ethereum** - Blockchain altyapısı
- **Sepolia Testnet** - Test ağı

### Frontend
- **React** - Kullanıcı arayüzü
- **Web3.js** - Blockchain etkileşimi
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar

## 📜 Akıllı Kontratlar

### BidToEarnV2 Kontratı
- **Adres:** `0xd0299989fD3553A8e9f34fE2040e4fDBE3692823`
- **Ağ:** Sepolia Testnet
- **Özellikler:**
  - Günlük varlık yönetimi
  - Commit-Reveal gizli teklif sistemi
  - Otomatik kazanan belirleme
  - Zaman tabanlı aşama yönetimi

## 🎮 Nasıl Çalışır?

### 1. Commit Aşaması
- Kullanıcılar gizli tekliflerini hash'leyerek gönderir
- Gerçek teklif miktarları görünmez
- Belirli süre boyunca teklifler toplanır

### 2. Reveal Aşaması  
- Kullanıcılar gerçek teklif miktarlarını açıklar
- Sistem hash doğrulaması yapar
- Geçersiz açıklamalar reddedilir

### 3. Kazanan Belirleme
- En düşük benzersiz teklif bulunur
- Kazanan otomatik olarak belirlenir
- Ödül sistemi aktif hale gelir

## 🔧 Kurulum

### Ön Gereksinimler
- MetaMask browser uzantısı
- Sepolia testnet ETH

### Frontend Çalıştırma
```bash
# Repository'yi klonlayın
git clone https://github.com/[username]/bidtoearn-platform.git

# Dependencies yükleyin  
npm install

# Development server başlatın
npm start
```

### Akıllı Kontrat Deploy
```bash
# Remix IDE kullanın
# remix.ethereum.org
# BidToEarnV2.sol dosyasını deploy edin
```

## 📊 Proje Durumu

- ✅ Akıllı kontrat geliştirme tamamlandı
- ✅ Frontend arayüz hazır
- ✅ Sepolia testnet'te canlı
- 🚧 Mainnet deploy planlanıyor
- 🚧 Token ödül sistemi geliştiriliyor

## 🧪 Test Etme

1. **MetaMask'ı Sepolia ağına** geçirin
2. **Test ETH** alın (faucet.quicknode.com)
3. **Platform'a** bağlanın
4. **Günlük varlığa** teklif verin
5. **Sonuçları** takip edin

## 📈 Gelecek Planları

- 🪙 **ERC-20 Token Ödülü** - Platform tokeni
- 🏅 **Leaderboard Sistemi** - Kazanan takibi
- 📊 **Analytics Dashboard** - İstatistikler
- 🌐 **Mainnet Deployment** - Production ortam
- 📱 **Mobile App** - Native uygulama

## 🤝 Katkıda Bulunma

Bu proje açık kaynak geliştirmeye açıktır!

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit atın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır.

## 📞 İletişim

- **Developer:** [GitHub Kullanıcı Adınız]
- **Email:** [email@domain.com]
- **Project Link:** [https://github.com/[username]/bidtoearn-platform]

## 🙏 Teşekkürler

- Ethereum Foundation
- OpenZeppelin
- Remix IDE Team
- Claude AI (Development Assistant)

---

⭐ **Bu projeyi beğendiyseniz star verin!**
