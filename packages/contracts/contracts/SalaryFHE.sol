/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.28;

/**
 * @notice Confidential salary aggregation with tiered public averages, live encrypted comparisons,
 *         and company benchmarking on FHEVM v0.11.
 */

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Categories } from "./lib/Categories.sol";

/**
 * @title SalaryFHE
 * @notice Individuals submit encrypted USD salaries once; public averages publish at tier
 *         boundaries (5, 10, 15, ... participants). Private comparisons always use the live
 *         encrypted pool average.
 */
contract SalaryFHE is ZamaEthereumConfig {
    struct TierPublish {
        euint64 encryptedSnapshot;
        bool snapshotReady;
        bool releaseRequested;
        bool finalized;
        uint64 clearAverage;
    }

    struct Bucket {
        euint64 encryptedSum;
        uint256 count;
        euint64 encryptedAverage;
        bool averageComputed;
        uint256 latestFinalizedTier;
        mapping(uint256 => TierPublish) tiers;
    }

    struct CompanyBucket {
        euint64 encryptedSum;
        uint256 count;
    }

    mapping(uint256 => Bucket) private _buckets;
    mapping(address => bool) public hasSubmitted;
    mapping(address => euint64) private _userSalaries;
    mapping(address => uint256) public userCategoryId;
    mapping(address => ebool) private _aboveAverage;
    mapping(address => bool) public comparisonReady;

    mapping(bytes32 => CompanyBucket) private _companyBuckets;
    mapping(bytes32 => ebool) private _companyAboveMarket;
    mapping(bytes32 => bool) private _companyComparisonReady;

    event SalarySubmitted(address indexed user, uint256 indexed categoryId, uint256 count);
    event AverageReleaseRequested(
        uint256 indexed categoryId,
        uint256 indexed tier,
        bytes32 averageHandle
    );
    event AverageFinalized(uint256 indexed categoryId, uint256 indexed tier, uint64 clearAverage);
    event ComparisonReady(address indexed user);
    event CompanySalarySubmitted(address indexed company, uint256 indexed categoryId, uint256 count);
    event CompanyComparisonReady(address indexed company, uint256 indexed categoryId);

    error AlreadySubmitted();
    error InvalidCategory();
    error AverageNotReady();
    error InvalidTier();
    error TierNotReady();
    error TierAlreadyRequested();
    error TierAlreadyFinalized();
    error TierNotRequested();
    error NotSubmitted();
    error ComparisonNotReady();
    error CompanyNotEnoughEmployees();

    function submitSalary(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId,
        externalEuint64 encSalary,
        bytes calldata inputProof
    ) external {
        if (hasSubmitted[msg.sender]) revert AlreadySubmitted();
        _validateCategory(positionId, cityId, seniorityId);

        euint64 salary = FHE.fromExternal(encSalary, inputProof);
        uint256 catId = Categories.categoryId(positionId, cityId, seniorityId);
        uint256 count = _addToMarket(catId, salary);

        _userSalaries[msg.sender] = salary;
        FHE.allowThis(_userSalaries[msg.sender]);
        FHE.allow(_userSalaries[msg.sender], msg.sender);

        userCategoryId[msg.sender] = catId;
        hasSubmitted[msg.sender] = true;

        emit SalarySubmitted(msg.sender, catId, count);
    }

    function submitCompanySalary(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId,
        externalEuint64 encSalary,
        bytes calldata inputProof
    ) external {
        _validateCategory(positionId, cityId, seniorityId);

        euint64 salary = FHE.fromExternal(encSalary, inputProof);
        uint256 catId = Categories.categoryId(positionId, cityId, seniorityId);

        _addToMarket(catId, salary);

        bytes32 key = _companyKey(msg.sender, catId);
        CompanyBucket storage cb = _companyBuckets[key];
        if (cb.count == 0) {
            cb.encryptedSum = salary;
        } else {
            cb.encryptedSum = FHE.add(cb.encryptedSum, salary);
        }
        FHE.allowThis(cb.encryptedSum);
        cb.count += 1;

        emit CompanySalarySubmitted(msg.sender, catId, cb.count);
    }

    /**
     * @notice Step 1 of tier public average release. Tier must be a multiple of MIN_PARTICIPANTS
     *         (5, 10, 15, ...) and a snapshot must exist from when the pool reached that count.
     */
    function requestAverageRelease(uint256 categoryId, uint256 tier) external {
        _validateTier(tier);
        Bucket storage bucket = _buckets[categoryId];
        TierPublish storage publish = bucket.tiers[tier];

        if (bucket.count < tier) revert TierNotReady();
        if (!publish.snapshotReady) revert TierNotReady();
        if (publish.releaseRequested) revert TierAlreadyRequested();

        publish.releaseRequested = true;
        FHE.makePubliclyDecryptable(publish.encryptedSnapshot);

        emit AverageReleaseRequested(categoryId, tier, FHE.toBytes32(publish.encryptedSnapshot));
    }

    /**
     * @notice Step 3: verify KMS proof and store the clear average for this tier snapshot.
     */
    function finalizeAverage(
        uint256 categoryId,
        uint256 tier,
        uint64 clearAverage,
        bytes calldata decryptionProof
    ) external {
        _validateTier(tier);
        Bucket storage bucket = _buckets[categoryId];
        TierPublish storage publish = bucket.tiers[tier];

        if (!publish.releaseRequested) revert TierNotRequested();
        if (publish.finalized) revert TierAlreadyFinalized();

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(publish.encryptedSnapshot);

        FHE.checkSignatures(cts, abi.encode(clearAverage), decryptionProof);

        publish.clearAverage = clearAverage;
        publish.finalized = true;
        if (tier > bucket.latestFinalizedTier) {
            bucket.latestFinalizedTier = tier;
        }

        emit AverageFinalized(categoryId, tier, clearAverage);
    }

    /**
     * @notice Compare submitter salary to the live encrypted pool average (user-decryptable ebool).
     */
    function compareToAverage() external {
        if (!hasSubmitted[msg.sender]) revert NotSubmitted();

        uint256 catId = userCategoryId[msg.sender];
        Bucket storage bucket = _buckets[catId];
        if (!bucket.averageComputed) revert AverageNotReady();

        _aboveAverage[msg.sender] = FHE.gt(_userSalaries[msg.sender], bucket.encryptedAverage);
        FHE.allowThis(_aboveAverage[msg.sender]);
        FHE.allow(_aboveAverage[msg.sender], msg.sender);

        comparisonReady[msg.sender] = true;
        emit ComparisonReady(msg.sender);
    }

    function computeCompanyComparison(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId
    ) external {
        _validateCategory(positionId, cityId, seniorityId);

        uint256 catId = Categories.categoryId(positionId, cityId, seniorityId);
        Bucket storage market = _buckets[catId];
        if (!market.averageComputed) revert AverageNotReady();

        bytes32 key = _companyKey(msg.sender, catId);
        CompanyBucket storage cb = _companyBuckets[key];
        if (cb.count < Categories.MIN_PARTICIPANTS) revert CompanyNotEnoughEmployees();

        euint64 companyAverage = FHE.div(cb.encryptedSum, uint64(cb.count));
        ebool above = FHE.gt(companyAverage, market.encryptedAverage);
        FHE.allowThis(above);
        FHE.allow(above, msg.sender);

        _companyAboveMarket[key] = above;
        _companyComparisonReady[key] = true;

        emit CompanyComparisonReady(msg.sender, catId);
    }

    function getBucketCount(uint256 categoryId) external view returns (uint256) {
        return _buckets[categoryId].count;
    }

    function isAverageComputed(uint256 categoryId) external view returns (bool) {
        return _buckets[categoryId].averageComputed;
    }

    function getClearAverage(uint256 categoryId, uint256 tier) external view returns (uint64) {
        return _buckets[categoryId].tiers[tier].clearAverage;
    }

    function isTierFinalized(uint256 categoryId, uint256 tier) external view returns (bool) {
        return _buckets[categoryId].tiers[tier].finalized;
    }

    function isTierSnapshotReady(uint256 categoryId, uint256 tier) external view returns (bool) {
        return _buckets[categoryId].tiers[tier].snapshotReady;
    }

    function getLatestFinalizedTier(uint256 categoryId) external view returns (uint256) {
        return _buckets[categoryId].latestFinalizedTier;
    }

    function getTierAverageHandle(uint256 categoryId, uint256 tier) external view returns (bytes32) {
        return FHE.toBytes32(_buckets[categoryId].tiers[tier].encryptedSnapshot);
    }

    function getAverageHandle(uint256 categoryId) external view returns (bytes32) {
        return FHE.toBytes32(_buckets[categoryId].encryptedAverage);
    }

    function getAboveAverageHandle(address user) external view returns (bytes32) {
        return FHE.toBytes32(_aboveAverage[user]);
    }

    function getCompanyBucketCount(
        address company,
        uint256 categoryId
    ) external view returns (uint256) {
        return _companyBuckets[_companyKey(company, categoryId)].count;
    }

    function isCompanyComparisonReady(
        address company,
        uint256 categoryId
    ) external view returns (bool) {
        return _companyComparisonReady[_companyKey(company, categoryId)];
    }

    function getCompanyAboveMarketHandle(
        address company,
        uint256 categoryId
    ) external view returns (bytes32) {
        return FHE.toBytes32(_companyAboveMarket[_companyKey(company, categoryId)]);
    }

    function computeCategoryId(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId
    ) external pure returns (uint256) {
        Categories.validateCategory(positionId, cityId, seniorityId);
        return Categories.categoryId(positionId, cityId, seniorityId);
    }

    function _addToMarket(uint256 catId, euint64 salary) internal returns (uint256) {
        Bucket storage bucket = _buckets[catId];

        if (bucket.count == 0) {
            bucket.encryptedSum = salary;
        } else {
            bucket.encryptedSum = FHE.add(bucket.encryptedSum, salary);
        }
        FHE.allowThis(bucket.encryptedSum);

        bucket.count += 1;

        if (bucket.count >= Categories.MIN_PARTICIPANTS) {
            _computeAverage(bucket);
        }

        if (bucket.count >= Categories.MIN_PARTICIPANTS && bucket.count % Categories.MIN_PARTICIPANTS == 0) {
            _snapshotTier(bucket, bucket.count);
        }

        return bucket.count;
    }

    function _computeAverage(Bucket storage bucket) internal {
        uint256 count = bucket.count;
        bucket.encryptedAverage = FHE.div(bucket.encryptedSum, uint64(count));
        bucket.averageComputed = true;
        FHE.allowThis(bucket.encryptedAverage);
    }

    function _snapshotTier(Bucket storage bucket, uint256 tier) internal {
        TierPublish storage publish = bucket.tiers[tier];
        publish.encryptedSnapshot = bucket.encryptedAverage;
        FHE.allowThis(publish.encryptedSnapshot);
        publish.snapshotReady = true;
    }

    function _validateTier(uint256 tier) internal pure {
        if (tier < Categories.MIN_PARTICIPANTS || tier % Categories.MIN_PARTICIPANTS != 0) {
            revert InvalidTier();
        }
    }

    function _validateCategory(
        uint16 positionId,
        uint16 cityId,
        uint16 seniorityId
    ) internal pure {
        if (positionId >= Categories.POSITION_COUNT) revert InvalidCategory();
        if (cityId >= Categories.CITY_COUNT) revert InvalidCategory();
        if (seniorityId >= Categories.SENIORITY_COUNT) revert InvalidCategory();
    }

    function _companyKey(address company, uint256 categoryId) internal pure returns (bytes32) {
        return keccak256(abi.encode(company, categoryId));
    }
}
