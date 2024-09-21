import fs from "node:fs";
import Docker from "dockerode";
import { execSync } from "node:child_process";

const docker = new Docker();

function getAllFilesInDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.map((file) => file);
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
    return [];
  }
}

async function buildImage(imageName) {
  const imagePath = `./images/${imageName}/`;
  const imageTag = `${imageName}:latest`;
  const files = getAllFilesInDirectory(imagePath);
  const tarStream = await docker.buildImage(
    { context: imagePath, src: ["Dockerfile", ...files] },
    { t: imageTag }
  );

  tarStream.pipe(process.stdout);
  return new Promise((resolve, reject) => {
    docker.modem.followProgress(tarStream, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function buildImages() {
  const images = ["js", "py"];
  try {
    for (const image of images) {
      console.info(`Building image: ${image}`);
      await buildImage(image);
      console.info(`Successfully built image: ${image}`);
    }
  } catch (error) {
    console.error(`Error building images: ${error}`);
    throw new Error(`Failed to build images: ${error}`);
  }
}

buildImages()
  .then(() => {
    execSync("npm start");
  })
  .catch((error) => {
    console.error(`Error building images: ${error}`);
    process.exit(1);
  });
