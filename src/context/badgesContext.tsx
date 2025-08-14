import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// ----------------- Types -----------------

// The SubBadge interface remains the same
export interface SubBadge {
  title: string;
  description: string;
  completed: boolean | null;
}

// BadgeCategory defines the structure for a single badge group (e.g., "Gold")
export interface BadgeCategory {
  name: string;
  style: string; // e.g., "gold", "silver", "bronze"
  subbadges: Record<string, SubBadge>;
}

// BadgesMap defines the overall data structure, an object of BadgeCategory
type BadgesMap = {
  [key: string]: BadgeCategory;
};

// The context type now correctly uses BadgesMap
interface BadgeContextType {
  badges: BadgesMap;
  setBadges: React.Dispatch<React.SetStateAction<BadgesMap>>;
}

// ----------------- Initial Data -----------------
const initialBadges: BadgesMap = {
  Gold: {
    name: "Gold",
    style: "gold",
    subbadges: {
      "Great Question": {
        title: "Great Question",
        description: "Asked a question with a score of 100 or more",
        completed: true,
      },
      "Great Answer": {
        title: "Great Answer",
        description: "Provided an answer with a score of 100 or more",
        completed: false,
      },
      Socratic: {
        title: "Socratic",
        description: "Have at least 10,000 points",
        completed: false,
      },
      Zombie: {
        title: "Zombie",
        description: "Answered a question more than 30 days after it was asked",
        completed: false,
      },
    },
  },
  Silver: {
    name: "Silver",
    style: "silver",
    subbadges: {
      "Good Question": {
        title: "Good Question",
        description: "Asked a question with a score of 25 or more",
        completed: true,
      },
      "Good Answer": {
        title: "Good Answer",
        description: "Provided an answer with a score of 25 or more",
        completed: false,
      },
      Inquisitive: {
        title: "Inquisitive",
        description: "Have at least 3,000 points",
        completed: false,
      },
      Protected: {
        title: "Protected",
        description: "Have a question that is protected",
        completed: false,
      },
    },
  },
  Bronze: {
    name: "Bronze",
    style: "bronze",
    subbadges: {
      "Nice Question": {
        title: "Nice Question",
        description: "Asked a question with a score of 10 or more",
        completed: true,
      },
      "Nice Answer": {
        title: "Nice Answer",
        description: "Provided an answer with a score of 10 or more",
        completed: false,
      },
      Curious: {
        title: "Curious",
        description: "Have at least 100 points",
        completed: false,
      },
      Scholar: {
        title: "Scholar",
        description: "Accept an answer",
        completed: null,
      },
    },
  },
};

// ----------------- Context -----------------
const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider = ({ children }: { children: ReactNode }) => {
  // Fix: The useState hook is now correctly typed as BadgesMap
  const [badges, setBadges] = useState<BadgesMap>(initialBadges);

  return (
    <BadgeContext.Provider value={{ badges, setBadges }}>
      {children}
    </BadgeContext.Provider>
  );
};

// ----------------- Hook -----------------
export const useBadges = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("useBadges must be used within a BadgeProvider");
  }
  return context;
};
