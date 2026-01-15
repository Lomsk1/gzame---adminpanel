import axiosAuth from "../../helper/axios";
import type { LevelConfigTypes } from "../../types/level-cofig/level-config";

export const levelConfigLoader = async () => {
  const levelConfigPromise = axiosAuth
    .get<LevelConfigTypes>("/api/v1/level-config")
    .then((res) => res.data.data);

  return {
    levelConfigData: levelConfigPromise,
  };
};
