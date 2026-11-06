import React, { useEffect, useState } from "react";
import {
  AppBar,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMatch, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define TopBar, a React component of Project 4.
 * Left: author name. Right: context of the main content + Advanced Features.
 */
function TopBar({ advancedFeatures, setAdvancedFeatures }) {
  const navigate = useNavigate();
  const detailMatch = useMatch("/users/:userId");
  const photosMatch = useMatch("/photos/:userId/*");
  const userId = (detailMatch || photosMatch)?.params.userId;

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    fetchModel(`/user/${userId}`)
      .then(setUser)
      .catch(() => setUser(null));
  }, [userId]);

  let context = "";
  if (user) {
    const name = `${user.first_name} ${user.last_name}`;
    context = photosMatch ? `Photos of ${name}` : name;
  }

  const handleToggle = (event) => {
    const enabled = event.target.checked;
    setAdvancedFeatures(enabled);
    // Leaving the single photo view when Advanced Features is turned off.
    if (!enabled && photosMatch) {
      navigate(`/photos/${photosMatch.params.userId}`);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" className="topbar-name">
          Đinh Thế Dũng
        </Typography>
        <FormControlLabel
          control={(
            <Checkbox
              checked={advancedFeatures}
              onChange={handleToggle}
              color="default"
            />
          )}
          label="Enable Advanced Features"
        />
        <Typography variant="h6" color="inherit" className="topbar-context">
          {context}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
