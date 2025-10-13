// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateGovernance
 * @dev Contrat de gouvernance pour EduChain Credentials
 * @author Benewende Pierre
 */
contract CertificateGovernance is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Événements
    event InstitutionRegistered(address indexed institution, string name, string email);
    event InstitutionVerified(address indexed institution, bool verified);
    event CertificateTemplateCreated(uint256 indexed templateId, string name, string description);
    event CertificateTemplateUpdated(uint256 indexed templateId, bool active);
    event CertificateRevoked(bytes32 indexed certificateHash, string reason);
    event CertificateVerified(bytes32 indexed certificateHash, bool isValid);
    event GovernanceUpdated(string parameter, string oldValue, string newValue);

    // Structures
    struct Institution {
        string name;
        string email;
        string website;
        bool isVerified;
        bool isActive;
        uint256 registrationDate;
        uint256 certificatesIssued;
        mapping(string => bool) authorizedFields;
    }

    struct CertificateTemplate {
        string name;
        string description;
        string[] requiredFields;
        bool isActive;
        uint256 createdAt;
        address createdBy;
    }

    struct CertificateRecord {
        bytes32 certificateHash;
        address institution;
        string studentName;
        string degree;
        string field;
        uint256 graduationDate;
        bool isVerified;
        bool isRevoked;
        string revokeReason;
        uint256 createdAt;
    }

    // Variables d'état
    mapping(address => Institution) public institutions;
    mapping(uint256 => CertificateTemplate) public certificateTemplates;
    mapping(bytes32 => CertificateRecord) public certificates;
    mapping(address => bool) public authorizedInstitutions;
    mapping(string => bool) public authorizedFields;

    Counters.Counter private _templateCounter;
    Counters.Counter private _certificateCounter;

    // Paramètres de gouvernance
    uint256 public minVerificationThreshold = 3;
    uint256 public maxInstitutionCertificates = 10000;
    uint256 public certificateValidityPeriod = 5 * 365 days; // 5 ans
    bool public registrationOpen = true;

    // Modificateurs
    modifier onlyVerifiedInstitution() {
        require(
            institutions[msg.sender].isVerified && institutions[msg.sender].isActive,
            "Institution non verifiee ou inactive"
        );
        _;
    }

    modifier onlyAuthorizedField(string memory field) {
        require(authorizedFields[field], "Domaine non autorise");
        _;
    }

    modifier validCertificateHash(bytes32 certificateHash) {
        require(certificateHash != bytes32(0), "Hash de certificat invalide");
        _;
    }

    constructor() {
        // Initialiser les domaines autorisés
        authorizedFields["Informatique"] = true;
        authorizedFields["Ingenierie"] = true;
        authorizedFields["Medecine"] = true;
        authorizedFields["Droit"] = true;
        authorizedFields["Economie"] = true;
        authorizedFields["Sciences"] = true;
        authorizedFields["Arts"] = true;
        authorizedFields["Education"] = true;
    }

    /**
     * @dev Enregistrer une nouvelle institution
     */
    function registerInstitution(
        string memory name,
        string memory email,
        string memory website
    ) external {
        require(registrationOpen, "Enregistrement ferme");
        require(bytes(name).length > 0, "Nom requis");
        require(bytes(email).length > 0, "Email requis");
        require(!institutions[msg.sender].isActive, "Institution deja enregistree");

        institutions[msg.sender] = Institution({
            name: name,
            email: email,
            website: website,
            isVerified: false,
            isActive: true,
            registrationDate: block.timestamp,
            certificatesIssued: 0
        });

        emit InstitutionRegistered(msg.sender, name, email);
    }

    /**
     * @dev Vérifier une institution (admin seulement)
     */
    function verifyInstitution(address institution, bool verified) external onlyOwner {
        require(institutions[institution].isActive, "Institution non active");
        
        institutions[institution].isVerified = verified;
        authorizedInstitutions[institution] = verified;

        emit InstitutionVerified(institution, verified);
    }

    /**
     * @dev Créer un template de certificat
     */
    function createCertificateTemplate(
        string memory name,
        string memory description,
        string[] memory requiredFields
    ) external onlyVerifiedInstitution {
        require(bytes(name).length > 0, "Nom requis");
        require(requiredFields.length > 0, "Champs requis necessaires");

        _templateCounter.increment();
        uint256 templateId = _templateCounter.current();

        certificateTemplates[templateId] = CertificateTemplate({
            name: name,
            description: description,
            requiredFields: requiredFields,
            isActive: true,
            createdAt: block.timestamp,
            createdBy: msg.sender
        });

        emit CertificateTemplateCreated(templateId, name, description);
    }

    /**
     * @dev Enregistrer un certificat
     */
    function registerCertificate(
        bytes32 certificateHash,
        string memory studentName,
        string memory degree,
        string memory field,
        uint256 graduationDate
    ) external onlyVerifiedInstitution onlyAuthorizedField(field) validCertificateHash(certificateHash) {
        require(certificates[certificateHash].createdAt == 0, "Certificat deja enregistre");
        require(graduationDate <= block.timestamp, "Date de graduation invalide");
        require(institutions[msg.sender].certificatesIssued < maxInstitutionCertificates, "Limite de certificats atteinte");

        certificates[certificateHash] = CertificateRecord({
            certificateHash: certificateHash,
            institution: msg.sender,
            studentName: studentName,
            degree: degree,
            field: field,
            graduationDate: graduationDate,
            isVerified: true,
            isRevoked: false,
            revokeReason: "",
            createdAt: block.timestamp
        });

        institutions[msg.sender].certificatesIssued++;
        _certificateCounter.increment();

        emit CertificateVerified(certificateHash, true);
    }

    /**
     * @dev Révoquer un certificat
     */
    function revokeCertificate(
        bytes32 certificateHash,
        string memory reason
    ) external onlyVerifiedInstitution validCertificateHash(certificateHash) {
        require(certificates[certificateHash].createdAt > 0, "Certificat non trouve");
        require(certificates[certificateHash].institution == msg.sender, "Pas autorise a revoquer ce certificat");
        require(!certificates[certificateHash].isRevoked, "Certificat deja revoque");

        certificates[certificateHash].isRevoked = true;
        certificates[certificateHash].revokeReason = reason;

        emit CertificateRevoked(certificateHash, reason);
    }

    /**
     * @dev Vérifier un certificat
     */
    function verifyCertificate(bytes32 certificateHash) external view returns (
        bool exists,
        bool isValid,
        bool isRevoked,
        address institution,
        string memory studentName,
        string memory degree,
        string memory field,
        uint256 graduationDate
    ) {
        CertificateRecord memory cert = certificates[certificateHash];
        
        exists = cert.createdAt > 0;
        isValid = exists && !cert.isRevoked && (block.timestamp - cert.graduationDate) <= certificateValidityPeriod;
        isRevoked = cert.isRevoked;
        institution = cert.institution;
        studentName = cert.studentName;
        degree = cert.degree;
        field = cert.field;
        graduationDate = cert.graduationDate;
    }

    /**
     * @dev Obtenir les statistiques d'une institution
     */
    function getInstitutionStats(address institution) external view returns (
        string memory name,
        bool isVerified,
        uint256 certificatesIssued,
        uint256 registrationDate
    ) {
        Institution storage inst = institutions[institution];
        return (
            inst.name,
            inst.isVerified,
            inst.certificatesIssued,
            inst.registrationDate
        );
    }

    /**
     * @dev Obtenir les statistiques globales
     */
    function getGlobalStats() external view returns (
        uint256 totalInstitutions,
        uint256 totalCertificates,
        uint256 totalTemplates,
        uint256 activeInstitutions
    ) {
        // Note: Cette implémentation est simplifiée
        // Dans une vraie implémentation, il faudrait itérer sur tous les mappings
        return (
            _templateCounter.current(), // Approximation
            _certificateCounter.current(),
            _templateCounter.current(),
            _templateCounter.current() // Approximation
        );
    }

    /**
     * @dev Mettre à jour les paramètres de gouvernance (admin seulement)
     */
    function updateGovernanceParameters(
        uint256 _minVerificationThreshold,
        uint256 _maxInstitutionCertificates,
        uint256 _certificateValidityPeriod,
        bool _registrationOpen
    ) external onlyOwner {
        string memory oldThreshold = string(abi.encodePacked(minVerificationThreshold));
        string memory newThreshold = string(abi.encodePacked(_minVerificationThreshold));
        
        minVerificationThreshold = _minVerificationThreshold;
        maxInstitutionCertificates = _maxInstitutionCertificates;
        certificateValidityPeriod = _certificateValidityPeriod;
        registrationOpen = _registrationOpen;

        emit GovernanceUpdated("minVerificationThreshold", oldThreshold, newThreshold);
    }

    /**
     * @dev Ajouter un domaine autorisé (admin seulement)
     */
    function addAuthorizedField(string memory field) external onlyOwner {
        require(bytes(field).length > 0, "Domaine requis");
        authorizedFields[field] = true;
    }

    /**
     * @dev Retirer un domaine autorisé (admin seulement)
     */
    function removeAuthorizedField(string memory field) external onlyOwner {
        authorizedFields[field] = false;
    }

    /**
     * @dev Obtenir la liste des domaines autorisés
     */
    function getAuthorizedFields() external view returns (string[] memory) {
        // Note: Cette implémentation est simplifiée
        // Dans une vraie implémentation, il faudrait maintenir une liste
        string[] memory fields = new string[](8);
        fields[0] = "Informatique";
        fields[1] = "Ingenierie";
        fields[2] = "Medecine";
        fields[3] = "Droit";
        fields[4] = "Economie";
        fields[5] = "Sciences";
        fields[6] = "Arts";
        fields[7] = "Education";
        return fields;
    }

    /**
     * @dev Fonction de récupération d'urgence (admin seulement)
     */
    function emergencyPause() external onlyOwner {
        registrationOpen = false;
    }

    /**
     * @dev Reprendre les opérations (admin seulement)
     */
    function resumeOperations() external onlyOwner {
        registrationOpen = true;
    }
}