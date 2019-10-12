# Simple weather visualizer

This project is written by me to demonstrate abilities to improve rendering big datasets on canvas.
For this feature, I use WebWorker API and IndexDB for storage and process datasets on the browser.

## How to run the app

Before installing it you require the Node.js and Yarn on your system.

```sh
yarn
yarn start
```

After executing these commands you will get the running web-application on http://localhost:1234

## Why I chose this tech-stack?

In nowadays, I think we should improve perfomance of applications if possible.
For this goal, I recommend to choose tiny libraries or frameworks or write self solutions.

My tech stack in this project:

- **Preact X** - because it is React-like framework with small size above 3KB
- **Parcel** - because zero-config bundler is a good choice for small projects
- **TypeScript** - because typings can improve DX in refactoring the codebase
- **Prettier** - because you should spend your mind to write solutions, not for formatting the code
- **Yarn** - because that package manager more powerful and stable than npm

If I had more time for this project, I would also add unit tests.
And for it I would choose **Jest**, amazing testing framework
