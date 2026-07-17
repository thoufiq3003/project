package com.example.Turf.repository;


import com.example.Turf.model.CricketMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface MatchRepository extends JpaRepository<CricketMatch, Long> {
	List<CricketMatch> findByUserId(Long userId);
}