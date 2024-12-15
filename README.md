# Sturdy Engine

Express powered server that allows video manipulation via REST API, all features are listed below:

- Allow users to upload videos with configurable limits of size and duration
  - These limits can be configured under the [src/constants.ts](./src/constants.ts) files
- Allow trimming a previously uploaded video
- Allow merging multiple previously uploaded video clips together
- Allow link sharing for specified duration or time-based expiry

## Technologies used

- **NodeJS** - as the base for project
- **Typescript** - language for writing the project
- **Prisma** - ORM for ease of use in database interaction
- **SQLite** - database to store the video metadata & other info
- **Express** - REST API framework
- **Zod** - for creation & validation of schema
- **Ffmpeg** - to work with video files
- **Prettier** - to format files in preferred manner
- **Jest** - as test framework
- & many others...

## Database design

There is only one model/table as of now, i.e. `videos` table, structure for which is as follows:

| Column      | Type     | default     | Nullable | Comment                                                                  |
| ----------- | -------- | ----------- | -------- | ------------------------------------------------------------------------ |
| id          | Int      | _generated_ | No       | Primary key                                                              |
| title       | String   |             | No       | Title of the video                                                       |
| description | String   |             | Yes      | Description of the video if required                                     |
| fileName    | String   |             | No       | Name of the file received from user                                      |
| filePath    | String   |             | No       | Exact path where the file is saved on server                             |
| size        | Float    |             | No       | Size of the video file in bytes                                          |
| duration    | Float    |             | No       | Duration of the video in seconds                                         |
| publicId    | String   | _generated_ | No       | Unique id used for sharing the video                                     |
| isShared    | Boolean  | false       | No       | Denotes if a video is shared                                             |
| sharedAt    | DateTime |             | Yes      | Timestamp at which the video was shared, used for calculating the expiry |
| sharedFor   | Int      |             | Yes      | File sharing duration in seconds                                         |
| createdAt   | DateTime | now         | No       | Timestamp when file was first saved to database                          |
| updatedAt   | DateTime | update time | No       | Timestamp of latest changes made to file                                 |

> Keys with _generated_ tag above are auto generated, unique & indexed

## Added features & their need

- There is a `/ping` endpoint that always returns 200 status code & is not part of the authentication, added to check if the server is operational
- For trimming a video the API initially accepted timestamp in seconds only, but since **ffmpeg** supports taking the timestamp in "HH:MM:SS" format, the support was added for it after proper validation of the input
- Link can be shared by providing an expiration time in future or some specific duration for which the link will remain active, say 30 minutes (converted to seconds before sending to API), this reduces the calculation needed beforehand in case someone wants to share a video for short duration
- Original filename is removed in favour of random 32 chars generated filename, it was done so to avoid filename clashing & avoid any issues with character casing

## Installation

- Make sure you have node v20 or above, can verify that using `node -v` command
- Yarn is used as package manager for the project, install that using `npm i -g yarn` command
- Install dependencies using `yarn` command

## Environment setup

- Create a new file **.env** at the root of the project & copy contents of [.env.example](./.env.example) to it
- Update the `AUTH_TOKEN` value as required, this will be the token that will work as **API key**
- Override the default port for the server using `PORT` variable; default value is `8000`

## Starting the server

- Use `yarn start` command to start the server
- Go to browser & open `http://localhost:{port}/docs` replacing `{port}` with port number from last command to read Swagger documentation
- All API endpoints are protected using a `Bearer token` based authorization which uses a static token set as `AUTH_TOKEN` in environment variables

> Use `yarn dev` command if is desired to open the server in development mode

## Testing

- Use `yarn test` command to start testing
- Use `yarn test --coverage` command to generate the coverage report

## References

- https://www.codespeedy.com/cut-a-video-in-specific-start-and-end-time-in-node-js
- https://swagger.io/docs/specification/v3_0/about
- https://stackoverflow.com/questions/31046930/how-to-cut-a-video-in-specific-start-end-time-in-ffmpeg-by-node-js
- https://stackoverflow.com/questions/7333232/how-to-concatenate-two-mp4-files-using-ffmpeg
- https://fluent-ffmpeg.github.io/index.html#reading-video-metadata
- https://stackoverflow.com/questions/52860868/typescript-paths-not-resolving-when-running-jest

---

<sub>Picked this name because I couldn't think of a better name & selected one from the github repo name suggestion</sub>
