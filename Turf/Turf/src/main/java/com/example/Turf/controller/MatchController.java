package com.example.Turf.controller;

import com.example.Turf.model.BallLog;
import com.example.Turf.model.CricketMatch;
import com.example.Turf.model.PlayerStat;
import com.example.Turf.repository.BallLogRepository;
import com.example.Turf.repository.MatchRepository;
import com.example.Turf.repository.PlayerStatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*") 
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PlayerStatRepository statRepository;

    @Autowired
    private BallLogRepository ballLogRepository; 

    @PostMapping("/setup")
    public CricketMatch setupMatch(@RequestBody CricketMatch match) {
        match.setStatus("TOSS_CALL");
        CricketMatch savedMatch = matchRepository.save(match);

        for (String player : match.getTeamAPlayers().split(",")) {
            PlayerStat stat = new PlayerStat();
            stat.setMatchId(savedMatch.getId());
            stat.setPlayerName(player.trim());
            stat.setTeamName(match.getTeamAName());
            statRepository.save(stat);
        }
        for (String player : match.getTeamBPlayers().split(",")) {
            PlayerStat stat = new PlayerStat();
            stat.setMatchId(savedMatch.getId());
            stat.setPlayerName(player.trim());
            stat.setTeamName(match.getTeamBName());
            statRepository.save(stat);
        }
        return savedMatch;
    }
    
    @GetMapping("/history/{userId}")
    public List<CricketMatch> getMatchHistory(@PathVariable Long userId) {
        return matchRepository.findByUserId(userId);
    }
    @PostMapping("/{id}/start")
    public CricketMatch startMatch(
            @PathVariable Long id, 
            @RequestParam String tossWinner, 
            @RequestParam String decision) {
        
        CricketMatch match = matchRepository.findById(id).orElseThrow();
        match.setTossWinner(tossWinner);
        match.setTossDecision(decision);

        boolean isTeamAWinner = tossWinner.equals(match.getTeamAName());

        if ("Bat".equalsIgnoreCase(decision)) {
            match.setBattingFirstTeam(isTeamAWinner ? "TEAM_A" : "TEAM_B");
            match.setBattingSecondTeam(isTeamAWinner ? "TEAM_B" : "TEAM_A");
        } else {
            match.setBattingFirstTeam(isTeamAWinner ? "TEAM_B" : "TEAM_A");
            match.setBattingSecondTeam(isTeamAWinner ? "TEAM_A" : "TEAM_B");
        }
        
        match.setStatus("FIRST_INNINGS");
        return matchRepository.save(match);
    }

    @PutMapping("/{id}/score")
    public CricketMatch updateScore(
            @PathVariable Long id, 
            @RequestParam String type,  
            @RequestParam int value,
            @RequestParam String striker,
            @RequestParam String bowler,
            @RequestParam(defaultValue = "false") boolean isWide,
            @RequestParam(defaultValue = "false") boolean isNoBall) {
        
        CricketMatch match = matchRepository.findById(id).orElseThrow();
        PlayerStat strikerStat = statRepository.findByMatchIdAndPlayerName(id, striker);
        PlayerStat bowlerStat = statRepository.findByMatchIdAndPlayerName(id, bowler);
        
        boolean isFirstInnings = "FIRST_INNINGS".equals(match.getStatus());
        String activeTeam = isFirstInnings ? match.getBattingFirstTeam() : match.getBattingSecondTeam();
        boolean isTeamA = "TEAM_A".equals(activeTeam);

        // --- PREPARE DELTA LOGGING FOR UNDO ---
        BallLog log = new BallLog();
        log.setMatchId(id);
        log.setInnings(match.getStatus());
        log.setStriker(striker);
        log.setBowler(bowler);
        log.setWasFreeHitActive(match.isFreeHit());

        // --- CALCULATE RUNS AND BALLS ---
        int runsToTeam = 0;
        int ballsToTeam = 0;
        int wicketsToTeam = 0;

        if (isWide) {
            runsToTeam = 1; 
        } else if (isNoBall) {
            runsToTeam = 1 + value; 
            if (strikerStat != null) {
                log.setStrikerRunsAdded(value);
                log.setStrikerBallsAdded(1); 
            }
            match.setFreeHit(true); 
            log.setMadeFreeHitActive(true);
        } else {
            runsToTeam = value;
            if ("run".equals(type)) {
                ballsToTeam = 1;
                log.setBowlerBallsAdded(1);
                if (strikerStat != null) {
                    log.setStrikerRunsAdded(value);
                    log.setStrikerBallsAdded(1);
                }
            } else if ("wicket".equals(type)) {
                ballsToTeam = 1;
                wicketsToTeam = 1;
                log.setBowlerBallsAdded(1);
                log.setBowlerWicketsAdded(1);
                log.setStrikerWasOut(true);
                if (strikerStat != null) log.setStrikerBallsAdded(1);
            }
            match.setFreeHit(false); 
        }

        log.setTeamRunsAdded(runsToTeam);
        log.setTeamBallsAdded(ballsToTeam);
        log.setTeamWicketsAdded(wicketsToTeam);

        // --- APPLY TO MATCH ENTITY ---
        if (isTeamA) {
            match.setTeamARuns(match.getTeamARuns() + runsToTeam);
            match.setTeamAWickets(match.getTeamAWickets() + wicketsToTeam);
            int newBalls = match.getTeamABalls() + ballsToTeam;
            if (newBalls >= 6) { match.setTeamAOvers(match.getTeamAOvers() + 1); match.setTeamABalls(newBalls - 6); } 
            else { match.setTeamABalls(newBalls); }
        } else {
            match.setTeamBRuns(match.getTeamBRuns() + runsToTeam);
            match.setTeamBWickets(match.getTeamBWickets() + wicketsToTeam);
            int newBalls = match.getTeamBBalls() + ballsToTeam;
            if (newBalls >= 6) { match.setTeamBOvers(match.getTeamBOvers() + 1); match.setTeamBBalls(newBalls - 6); } 
            else { match.setTeamBBalls(newBalls); }
        }

        // --- APPLY TO PLAYER STATS ---
        if (strikerStat != null) {
            strikerStat.setRunsScored(strikerStat.getRunsScored() + log.getStrikerRunsAdded());
            strikerStat.setBallsFaced(strikerStat.getBallsFaced() + log.getStrikerBallsAdded());
            if (log.isStrikerWasOut()) strikerStat.setOut(true);
            statRepository.save(strikerStat);
        }
        if (bowlerStat != null) {
            bowlerStat.setBallsBowled(bowlerStat.getBallsBowled() + log.getBowlerBallsAdded());
            bowlerStat.setWicketsTaken(bowlerStat.getWicketsTaken() + log.getBowlerWicketsAdded());
            statRepository.save(bowlerStat);
        }

        ballLogRepository.save(log); 
        checkMatchStatus(match, isFirstInnings);
        return matchRepository.save(match);
    }

    // --- UNDO ENDPOINT ---
    @PostMapping("/{id}/undo")
    public CricketMatch undoLastBall(@PathVariable Long id) {
        CricketMatch match = matchRepository.findById(id).orElseThrow();
        
        if ("FINISHED".equals(match.getStatus())) return match; 

        Optional<BallLog> lastLogOpt = ballLogRepository.findTopByMatchIdOrderByIdDesc(id);
        if (!lastLogOpt.isPresent()) return match; 

        BallLog lastLog = lastLogOpt.get();
        boolean isTeamA = "TEAM_A".equals("FIRST_INNINGS".equals(lastLog.getInnings()) ? match.getBattingFirstTeam() : match.getBattingSecondTeam());

        // Reverse Match Stats
        if (isTeamA) {
            match.setTeamARuns(match.getTeamARuns() - lastLog.getTeamRunsAdded());
            match.setTeamAWickets(match.getTeamAWickets() - lastLog.getTeamWicketsAdded());
            
            int totalBallsBefore = (match.getTeamAOvers() * 6) + match.getTeamABalls() - lastLog.getTeamBallsAdded();
            match.setTeamAOvers(totalBallsBefore / 6);
            match.setTeamABalls(totalBallsBefore % 6);
        } else {
            match.setTeamBRuns(match.getTeamBRuns() - lastLog.getTeamRunsAdded());
            match.setTeamBWickets(match.getTeamBWickets() - lastLog.getTeamWicketsAdded());
            
            int totalBallsBefore = (match.getTeamBOvers() * 6) + match.getTeamBBalls() - lastLog.getTeamBallsAdded();
            match.setTeamBOvers(totalBallsBefore / 6);
            match.setTeamBBalls(totalBallsBefore % 6);
        }

        // Restore Free Hit State
        match.setFreeHit(lastLog.isWasFreeHitActive());

        // Reverse Player Stats
        PlayerStat strikerStat = statRepository.findByMatchIdAndPlayerName(id, lastLog.getStriker());
        if (strikerStat != null) {
            strikerStat.setRunsScored(strikerStat.getRunsScored() - lastLog.getStrikerRunsAdded());
            strikerStat.setBallsFaced(strikerStat.getBallsFaced() - lastLog.getStrikerBallsAdded());
            if (lastLog.isStrikerWasOut()) strikerStat.setOut(false);
            statRepository.save(strikerStat);
        }

        PlayerStat bowlerStat = statRepository.findByMatchIdAndPlayerName(id, lastLog.getBowler());
        if (bowlerStat != null) {
            bowlerStat.setBallsBowled(bowlerStat.getBallsBowled() - lastLog.getBowlerBallsAdded());
            bowlerStat.setWicketsTaken(bowlerStat.getWicketsTaken() - lastLog.getBowlerWicketsAdded());
            statRepository.save(bowlerStat);
        }

        ballLogRepository.delete(lastLog);
        return matchRepository.save(match);
    }

    private void checkMatchStatus(CricketMatch match, boolean isFirstInnings) {
        int aRuns = match.getTeamARuns(); int bRuns = match.getTeamBRuns();
        int aWickets = match.getTeamAWickets(); int bWickets = match.getTeamBWickets();
        int aOvers = match.getTeamAOvers(); int bOvers = match.getTeamBOvers();
        int limit = match.getPlayerLimit(); int maxOvers = match.getMaxOvers();

        if (isFirstInnings) {
            boolean allOut = "TEAM_A".equals(match.getBattingFirstTeam()) ? aWickets >= limit - 1 : bWickets >= limit - 1; 
            boolean oversDone = "TEAM_A".equals(match.getBattingFirstTeam()) ? aOvers >= maxOvers : bOvers >= maxOvers;
            if (allOut || oversDone) match.setStatus("SECOND_INNINGS");
        } else {
            int target = "TEAM_A".equals(match.getBattingFirstTeam()) ? aRuns + 1 : bRuns + 1;
            int chasingRuns = "TEAM_A".equals(match.getBattingSecondTeam()) ? aRuns : bRuns;
            boolean allOut = "TEAM_A".equals(match.getBattingSecondTeam()) ? aWickets >= limit - 1 : bWickets >= limit - 1;
            boolean oversDone = "TEAM_A".equals(match.getBattingSecondTeam()) ? aOvers >= maxOvers : bOvers >= maxOvers;

            if (chasingRuns >= target || allOut || oversDone) {
                declareWinner(match);
            }
        }
    }

    private void declareWinner(CricketMatch match) {
        if (match.getTeamARuns() > match.getTeamBRuns()) match.setWinner(match.getTeamAName());
        else if (match.getTeamBRuns() > match.getTeamARuns()) match.setWinner(match.getTeamBName());
        else match.setWinner("Match Tied");
        match.setStatus("FINISHED");
    }

    @GetMapping("/{id}/stats")
    public List<PlayerStat> getScoreboard(@PathVariable Long id) {
        return statRepository.findByMatchId(id);
    }
}