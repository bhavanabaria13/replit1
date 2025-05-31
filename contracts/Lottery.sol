// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lottery {
    address public owner;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public constant MAX_TICKETS = 50;
    uint256 public currentRound = 1;

    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 ticketSaleEndTime;
        uint256 endTime;
        uint256 prizePool;
        address[] ticketHolders;
        address winner;
        bool isActive;
        bool isDrawn;
        mapping(uint256 => address) ticketOwners;
        mapping(address => uint256[]) userTickets;
        uint256 winningTicketId;
    }

    mapping(uint256 => Round) public rounds;

    event TicketPurchased(uint256 indexed roundId, uint256 indexed ticketId, address indexed buyer, uint256 price);
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 ticketSaleEndTime, uint256 endTime);
    event WinnerDeclaredAndPaid(uint256 indexed roundId, uint256 ticketId, address indexed winner, uint256 prize);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier roundActive(uint256 roundId) {
        Round storage round = rounds[roundId];
        require(round.isActive, "Round is not active");
        require(block.timestamp >= round.startTime, "Round has not started yet");
        require(block.timestamp < round.ticketSaleEndTime, "Ticket sales have ended");
        _;
    }

    constructor() {
        owner = msg.sender;
        _startNewRound();
    }

    function _startNewRound() internal {
        Round storage newRound = rounds[currentRound];
        newRound.id = currentRound;
        newRound.isActive = false;
        newRound.isDrawn = false;
    }

    function setRoundSchedule(
        uint256 roundId,
        uint256 startTime,
        uint256 ticketSaleEndTime,
        uint256 endTime
    ) external onlyOwner {
        require(!rounds[roundId].isActive, "Round already active");
        require(startTime < ticketSaleEndTime, "Start must be before ticket sale end");
        require(ticketSaleEndTime < endTime, "Ticket sale must end before round end");

        Round storage round = rounds[roundId];
        round.startTime = startTime;
        round.ticketSaleEndTime = ticketSaleEndTime;
        round.endTime = endTime;
    }

    function activateRound(uint256 roundId) external onlyOwner {
        Round storage round = rounds[roundId];
        require(!round.isActive, "Round already active");
        require(round.startTime > 0 && round.ticketSaleEndTime > 0 && round.endTime > 0, "Schedule not set");
        round.isActive = true;
        emit RoundStarted(roundId, round.startTime, round.ticketSaleEndTime, round.endTime);
    }

    function _advanceToNextRoundIfExpired() internal {
        Round storage round = rounds[currentRound];
        if (
            block.timestamp > round.ticketSaleEndTime &&
            round.isActive &&
            !round.isDrawn
        ) {
            round.isActive = false;
        }

        if (!rounds[currentRound].isActive && rounds[currentRound + 1].startTime > 0) {
            currentRound++;
        }
    }

    function purchaseTicket(uint256 roundId, uint256 ticketId) external payable roundActive(roundId) {
        _advanceToNextRoundIfExpired();
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(ticketId >= 1 && ticketId <= MAX_TICKETS, "Invalid ticket ID");
        require(rounds[roundId].ticketOwners[ticketId] == address(0), "Ticket already sold");

        Round storage round = rounds[roundId];
        round.ticketOwners[ticketId] = msg.sender;
        round.userTickets[msg.sender].push(ticketId);
        round.ticketHolders.push(msg.sender);
        round.prizePool += msg.value;

        emit TicketPurchased(roundId, ticketId, msg.sender, msg.value);
    }

    function drawWinner(uint256 roundId) public onlyOwner {
        Round storage round = rounds[roundId];
        require(round.isActive, "Round is not active");
        require(block.timestamp >= round.endTime, "Round has not ended yet");
        require(!round.isDrawn, "Winner already drawn");

        uint256[] memory purchasedTickets = new uint256[](MAX_TICKETS);
        uint256 count = 0;

        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            if (round.ticketOwners[i] != address(0)) {
                purchasedTickets[count] = i;
                count++;
            }
        }

        require(count > 0, "No tickets sold");

        uint256[] memory validTickets = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            validTickets[j] = purchasedTickets[j];
        }

        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                validTickets.length,
                blockhash(block.number - 1)
            ))
        ) % validTickets.length;

        uint256 winningTicketId = validTickets[randomIndex];
        address winner = round.ticketOwners[winningTicketId];
        require(winner != address(0), "Winner address is zero");

        uint256 fixedPrize = 0.1 ether;
        require(address(this).balance >= fixedPrize, "Insufficient contract balance for prize");

        (bool success, ) = payable(winner).call{value: fixedPrize}("");
        require(success, "Prize transfer failed");

        round.winningTicketId = winningTicketId;
        round.winner = winner;
        round.isDrawn = true;
        round.isActive = false;

        emit WinnerDeclaredAndPaid(roundId, winningTicketId, winner, fixedPrize);

        // Prepare next round
        currentRound++;
        _resetRound(currentRound);
    }

    function _resetRound(uint256 roundId) internal {
        Round storage round = rounds[roundId];
        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            delete round.ticketOwners[i];
        }
        for (uint256 i = 0; i < round.ticketHolders.length; i++) {
            address holder = round.ticketHolders[i];
            delete round.userTickets[holder];
        }
        delete round.ticketHolders;

        round.id = roundId;
        round.prizePool = 0;
        round.winner = address(0);
        round.winningTicketId = 0;
        round.isActive = false;
        round.isDrawn = false;
        round.startTime = 0;
        round.ticketSaleEndTime = 0;
        round.endTime = 0;
    }

    function getTicketOwner(uint256 roundId, uint256 ticketId) external view returns (address) {
        return rounds[roundId].ticketOwners[ticketId];
    }

    function getUserTickets(uint256 roundId, address user) external view returns (uint256[] memory) {
        return rounds[roundId].userTickets[user];
    }

    function getRoundInfo(uint256 roundId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 ticketSaleEndTime,
        uint256 endTime,
        uint256 prizePool,
        address winner,
        bool isActive,
        bool isDrawn,
        uint256 ticketsSold
    ) {
        Round storage round = rounds[roundId];
        return (
            round.id,
            round.startTime,
            round.ticketSaleEndTime,
            round.endTime,
            round.prizePool,
            round.winner,
            round.isActive,
            round.isDrawn,
            round.ticketHolders.length
        );
    }

    function getCurrentRound() public returns (uint256) {
        _advanceToNextRoundIfExpired();
        return currentRound;
    }

    function getAvailableTickets(uint256 roundId) external view returns (uint256[] memory) {
        uint256[] memory available = new uint256[](MAX_TICKETS);
        uint256 count = 0;

        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            if (rounds[roundId].ticketOwners[i] == address(0)) {
                available[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = available[i];
        }

        return result;
    }

    function endCurrentRoundNow() public onlyOwner {
    require(rounds[currentRound].isActive, "Current round already ended");
    require(block.timestamp < rounds[currentRound].endTime, "Round already ended");

    rounds[currentRound].endTime = block.timestamp;
    rounds[currentRound].isActive = false; // ✅ Mark the round as inactive
}



    function setTicketPrice(uint256 _newPrice) external onlyOwner {
        ticketPrice = _newPrice;
    }

    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    function getPurchasedTickets(uint256 roundId) external view returns (uint256[] memory, address[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            if (rounds[roundId].ticketOwners[i] != address(0)) {
                count++;
            }
        }

        uint256[] memory ticketIds = new uint256[](count);
        address[] memory owners = new address[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            if (rounds[roundId].ticketOwners[i] != address(0)) {
                ticketIds[index] = i;
                owners[index] = rounds[roundId].ticketOwners[i];
                index++;
            }
        }

        return (ticketIds, owners);
    }

    function getWinnerInfo(uint256 roundId) external view returns (
        address winner,
        uint256 prize,
        uint256 winningTicketId,
        bool ownershipVerified
    ) {
        Round storage round = rounds[roundId];
        winner = round.winner;
        prize = round.isDrawn ? 0 : 0.1 ether;
        winningTicketId = round.winningTicketId;
        ownershipVerified = (round.ticketOwners[winningTicketId] == winner);
    }

    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
