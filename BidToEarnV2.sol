// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BidToEarnV2 {
    
    // Günlük varlık yapısı
    struct DailyAsset {
        string name;
        string description;
        uint256 startTime;
        uint256 commitEndTime;  // Teklif verme bitiş zamanı
        uint256 revealEndTime;  // Açıklama bitiş zamanı
        uint256 minBid;
        bool ended;
        address winner;
        uint256 winningBid;
    }
    
    // Teklif yapısı
    struct Bid {
        bytes32 commitment;  // Hash'lenmiş teklif
        uint256 amount;      // Açıklanan teklif miktarı
        bool revealed;       // Açıklandı mı?
    }
    
    // Mapping'ler
    mapping(uint256 => DailyAsset) public dailyAssets;
    mapping(uint256 => mapping(address => Bid)) public bids;
    mapping(uint256 => address[]) public bidders;
    
    // Durum değişkenleri
    uint256 public currentAssetId = 0;
    address public owner;
    
    // Events
    event AssetCreated(uint256 indexed assetId, string name, uint256 commitEndTime);
    event BidCommitted(uint256 indexed assetId, address indexed bidder);
    event BidRevealed(uint256 indexed assetId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed assetId, address winner, uint256 winningBid);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    // Günlük varlık oluşturma (sadece owner)
    function createDailyAsset(
        string memory _name,
        string memory _description,
        uint256 _commitDuration,  // Saat cinsinden
        uint256 _revealDuration,  // Saat cinsinden
        uint256 _minBid
    ) public onlyOwner {
        uint256 assetId = currentAssetId++;
        
        DailyAsset storage asset = dailyAssets[assetId];
        asset.name = _name;
        asset.description = _description;
        asset.startTime = block.timestamp;
        asset.commitEndTime = block.timestamp + (_commitDuration * 1 hours);
        asset.revealEndTime = asset.commitEndTime + (_revealDuration * 1 hours);
        asset.minBid = _minBid;
        asset.ended = false;
        
        emit AssetCreated(assetId, _name, asset.commitEndTime);
    }
    
    // Gizli teklif verme (Commit Phase)
    function commitBid(uint256 _assetId, bytes32 _commitment) public {
        DailyAsset storage asset = dailyAssets[_assetId];
        require(block.timestamp < asset.commitEndTime, "Commit phase ended");
        require(!asset.ended, "Auction already ended");
        
        // Eğer daha önce teklif vermemişse bidders listesine ekle
        if(bids[_assetId][msg.sender].commitment == bytes32(0)) {
            bidders[_assetId].push(msg.sender);
        }
        
        bids[_assetId][msg.sender].commitment = _commitment;
        
        emit BidCommitted(_assetId, msg.sender);
    }
    
    // Teklifi açıklama (Reveal Phase)
    function revealBid(uint256 _assetId, uint256 _amount, uint256 _nonce) public {
        DailyAsset storage asset = dailyAssets[_assetId];
        require(block.timestamp >= asset.commitEndTime, "Commit phase not ended");
        require(block.timestamp < asset.revealEndTime, "Reveal phase ended");
        require(!asset.ended, "Auction already ended");
        
        Bid storage bid = bids[_assetId][msg.sender];
        require(bid.commitment != bytes32(0), "No commitment found");
        require(!bid.revealed, "Already revealed");
        
        // Hash doğrulama
        bytes32 hash = keccak256(abi.encodePacked(_amount, _nonce, msg.sender));
        require(hash == bid.commitment, "Invalid reveal");
        require(_amount >= asset.minBid, "Bid below minimum");
        
        bid.amount = _amount;
        bid.revealed = true;
        
        emit BidRevealed(_assetId, msg.sender, _amount);
    }
    
    // Açık eksiltmeyi sonlandır ve kazananı belirle
    function endAuction(uint256 _assetId) public {
        DailyAsset storage asset = dailyAssets[_assetId];
        require(block.timestamp >= asset.revealEndTime, "Reveal phase not ended");
        require(!asset.ended, "Already ended");
        
        // En düşük benzersiz teklifi bul
        uint256 lowestUniqueBid = type(uint256).max;
        address winner = address(0);
        
        address[] memory assetBidders = bidders[_assetId];
        
        for(uint256 i = 0; i < assetBidders.length; i++) {
            address bidder = assetBidders[i];
            Bid memory bid = bids[_assetId][bidder];
            
            if(bid.revealed && bid.amount < lowestUniqueBid) {
                // Bu teklif benzersiz mi kontrol et
                bool isUnique = true;
                for(uint256 j = 0; j < assetBidders.length; j++) {
                    if(i != j && bids[_assetId][assetBidders[j]].revealed) {
                        if(bids[_assetId][assetBidders[j]].amount == bid.amount) {
                            isUnique = false;
                            break;
                        }
                    }
                }
                
                if(isUnique) {
                    lowestUniqueBid = bid.amount;
                    winner = bidder;
                }
            }
        }
        
        asset.ended = true;
        asset.winner = winner;
        asset.winningBid = lowestUniqueBid;
        
        emit AuctionEnded(_assetId, winner, lowestUniqueBid);
    }
    
    // Yardımcı fonksiyonlar
    function generateCommitment(uint256 _amount, uint256 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(_amount, _nonce, msg.sender));
    }
    
    function getAssetInfo(uint256 _assetId) public view returns (
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 commitEndTime,
        uint256 revealEndTime,
        uint256 minBid,
        bool ended,
        address winner,
        uint256 winningBid
    ) {
        DailyAsset memory asset = dailyAssets[_assetId];
        return (
            asset.name,
            asset.description,
            asset.startTime,
            asset.commitEndTime,
            asset.revealEndTime,
            asset.minBid,
            asset.ended,
            asset.winner,
            asset.winningBid
        );
    }
    
    function getBiddersCount(uint256 _assetId) public view returns (uint256) {
        return bidders[_assetId].length;
    }
}
