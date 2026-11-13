import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Typography,
} from "@mui/material";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel, { formatDate, imageUrl } from "../../lib/fetchModelData";

/**
 * Display one photo together with its creation date and all its comments.
 */
function PhotoCard({ photo }) {
  const comments = photo.comments || [];
  return (
    <Card className="photo-card" variant="outlined">
      <CardMedia
        component="img"
        image={imageUrl(photo.file_name)}
        alt={photo.file_name}
        className="photo-image"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Posted: {formatDate(photo.date_time)}
        </Typography>
        <Divider className="photo-divider" />
        <Typography variant="subtitle1">
          Comments ({comments.length})
        </Typography>
        {comments.map((c) => (
          <div key={c._id} className="photo-comment">
            <Typography variant="body2">
              <Link to={`/users/${c.user._id}`}>
                {c.user.first_name} {c.user.last_name}
              </Link>
              {" - "}
              <span className="photo-comment-date">
                {formatDate(c.date_time)}
              </span>
            </Typography>
            <Typography variant="body1">{c.comment}</Typography>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Define UserPhotos, a React component of Project 4.
 * Shows all photos of a user, or (with Advanced Features) a single photo
 * with a stepper to move between photos.
 */
  function UserPhotos({ advancedFeatures, setAdvancedFeatures }) {
    const { userId, photoId } = useParams();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      setPhotos(null);
      setError(null);
      fetchModel(`/photosOfUser/${userId}`)
        .then(setPhotos)
        .catch((err) => setError(err.message));
    }, [userId]);

    // Entering through a deep link to a single photo turns on the stepper.
    useEffect(() => {
      if (photoId && !advancedFeatures) {
        setAdvancedFeatures(true);
      }
    }, [photoId, advancedFeatures, setAdvancedFeatures]);

    if (error) {
      return <Typography color="error">Cannot load photos: {error}</Typography>;
    }
    if (!photos) {
      return <Typography>Loading...</Typography>;
    }
    if (photos.length === 0) {
      return <Typography>This user has no photos.</Typography>;
    }

    // Original view: all photos of the user.
    if (!advancedFeatures && !photoId) {
      return (
        <div>
          {photos.map((photo) => (
            <PhotoCard key={photo._id} photo={photo} />
          ))}
        </div>
      );
    }

    // Advanced view: one photo at a time, identified in the URL.
    if (!photoId) {
      return <Navigate replace to={`/photos/${userId}/${photos[0]._id}`} />;
    }
    const index = photos.findIndex((p) => p._id === photoId);
    if (index === -1) {
      return <Typography color="error">Photo not found.</Typography>;
    }
    const goTo = (i) => navigate(`/photos/${userId}/${photos[i]._id}`);

    return (
      <div>
        <div className="photo-stepper">
          <Button
            variant="outlined"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            Previous
          </Button>
          <Typography className="photo-stepper-label">
            Photo {index + 1} of {photos.length}
          </Typography>
          <Button
            variant="outlined"
            disabled={index === photos.length - 1}
            onClick={() => goTo(index + 1)}
          >
            Next
          </Button>
        </div>
        <PhotoCard photo={photos[index]} />
      </div>
    );
  }

  export default UserPhotos;
