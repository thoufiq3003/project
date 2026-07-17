package com.example.Turf.repository;
import com.example.Turf.model.BallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BallLogRepository extends JpaRepository<BallLog, Long> {
    // Finds the most recent ball bowled in the match for the Undo function
    Optional<BallLog> findTopByMatchIdOrderByIdDesc(Long matchId);
}