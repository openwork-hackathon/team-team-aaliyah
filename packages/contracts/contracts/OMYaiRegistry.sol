// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OMYaiRegistry
 * @dev Registry for AI agents (OMYai) with token gating and verification.
 */
contract OMYaiRegistry is Ownable {
    struct Agent {
        string profileURI;
        bool isVerified;
        address owner;
    }

    IERC20 public openworkToken;

    mapping(address => Agent) public agents;
    mapping(string => bool) public usedURIs;

    event AgentRegistered(address indexed agentOwner, string profileURI);
    event AgentVerified(address indexed agentOwner);
    event ProfileUpdated(address indexed agentOwner, string newProfileURI);

    constructor(address _openworkToken) Ownable(msg.sender) {
        openworkToken = IERC20(_openworkToken);
    }

    /**
     * @dev Register an AI agent. Requires $OPENWORK token balance.
     * @param _profileURI The URI pointing to the agent's metadata (IPFS, etc.)
     */
    function registerAgent(string memory _profileURI) external {
        require(openworkToken.balanceOf(msg.sender) > 0, "OMYaiRegistry: Insufficient $OPENWORK balance");
        require(bytes(_profileURI).length > 0, "OMYaiRegistry: Profile URI cannot be empty");
        require(!usedURIs[_profileURI], "OMYaiRegistry: URI already registered");
        require(agents[msg.sender].owner == address(0), "OMYaiRegistry: Agent already registered for this address");

        agents[msg.sender] = Agent({
            profileURI: _profileURI,
            isVerified: false,
            owner: msg.sender
        });
        usedURIs[_profileURI] = true;

        emit AgentRegistered(msg.sender, _profileURI);
    }

    /**
     * @dev Verify an agent. Only callable by the platform owner.
     * @param _agentOwner The address of the agent's owner.
     */
    function verifyAgent(address _agentOwner) external onlyOwner {
        require(agents[_agentOwner].owner != address(0), "OMYaiRegistry: Agent not registered");
        agents[_agentOwner].isVerified = true;
        emit AgentVerified(_agentOwner);
    }

    /**
     * @dev Update the profile URI for a registered agent.
     * @param _newProfileURI The new URI pointing to metadata.
     */
    function updateProfileURI(string memory _newProfileURI) external {
        require(agents[msg.sender].owner != address(0), "OMYaiRegistry: Agent not registered");
        require(bytes(_newProfileURI).length > 0, "OMYaiRegistry: Profile URI cannot be empty");
        
        usedURIs[agents[msg.sender].profileURI] = false;
        agents[msg.sender].profileURI = _newProfileURI;
        usedURIs[_newProfileURI] = true;
        
        // Reset verification on profile update as metadata changed
        agents[msg.sender].isVerified = false;

        emit ProfileUpdated(msg.sender, _newProfileURI);
    }

    /**
     * @dev Update the OPENWORK token address. Only owner.
     * @param _newAddress The new token address.
     */
    function setTokenAddress(address _newAddress) external onlyOwner {
        openworkToken = IERC20(_newAddress);
    }
}
