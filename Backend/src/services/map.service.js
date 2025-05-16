import axios from "axios";
import captainModel from "../models/captain.model.js";

// Declare API key once at the top
const apiKey = process.env.ORS_API_KEY;

// Get coordinates of an address
const getAddressCoordinates = async (address) => {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${address}`;
  try {
    const response = await axios.get(url);
    if (response.data.features.length === 0) {
      return null;
    }
    const features = response.data.features[0];
    const [lng, lat] = features.geometry.coordinates;
    return { lat, lng };
  } catch (error) {
    console.error(error);
  }
};

// Get distance and time between two points
const getDistanceAndTime = async (origin, destination) => {
  if (!origin || !destination) {
    return null;
  }
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  try {
    const res = await axios.post(
      url,
      {
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ],
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.data.routes[0].summary) return null;
    const { distance, duration } = res.data.routes[0].summary;
    return { distance, duration };
  } catch (error) {
    console.error(error);
  }
};

// Get suggestions for an address
const getSuggestions = async (input) => {
  if (!input) {
    return null;
  }
  const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${input}`;
  
  try {
    const response = await axios.get(url);
    if (response.data.features.length === 0) {
      return null;
    }
    return response.data.features;
  } catch (error) {
    console.error(error);
  }
};

const getCaptainsInRadius = async (ltd, lng, radius) => {
  // radius in km
  const captains = await captainModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 6371],
      },
    },
  });

  return captains;
};

export {
  getAddressCoordinates,
  getDistanceAndTime,
  getSuggestions,
  getCaptainsInRadius,
};
