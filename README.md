# MyGarden Planner

*Welcome to MyGarden Planner – a web app that helps gardeners track and manage their plants, set reminders for plant care tasks, and connect with a community of fellow gardeners.*

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Installation](#installation)  
   - [Accessing the Hosted App](#accessing-the-hosted-app)  
4. [Usage](#usage)  
   - [Dashboard](#dashboard)  
   - [Plant Library](#plant-library)  
   - [Planner](#planner)  
   - [Profile](#profile)  
   - [Community Forum](#community-forum)  
   - [Inbox (Notifications)](#inbox-notifications)  
   - [Settings](#settings)  
5. [Project Structure](#project-structure)  
6. [Contributing](#contributing)  


---

## Overview
(#overview)

MyGarden Planner is a dynamic web application designed for both novice and experienced gardeners. Users can:

- Add plants to a personal library, upload photos, and track growth progress.  
- Create tasks for watering, fertilising, pruning and receive reminders.  
- Browse and share gardening tips in a community forum, complete with likes, comments, and    follows.  
- View a summary of plant count and upcoming tasks on the Dashboard.  
- Manage their own profile, toggle Dark Mode, and see social interactions (followers/following).  

This app is built with React (via Vite), Supabase for authentication and database, and tailored CSS for a green/khaki “garden” aesthetic.

---

## Features
(#features)

- **User Authentication** (email/password, Supabase Auth)  
- **Plant Management**: Add/remove plants, upload photos, make notes.  
- **Reminders & Alerts**: Create tasks & due‐date reminders (e.g., water, fertilise, prune).  
- **Community Interaction**: Post captions and optional images; like, comment, follow.  
- **Notifications Inbox**: See who liked or commented on your posts, or who followed you.  
- **User Profiles**: Custom username, avatar, Dark Mode toggle, followers/following lists.  
- **Responsive Design**: Works across desktop and mobile browsers.  

---

## Installation
(#installation)

### Accessing the Hosted App

1. Open your preferred web browser (Chrome, Firefox, Edge, or Safari).  
2. Navigate to the live URL: 'https://gardenplanner.vercel.app'
3. **Sign Up** (if first time) or **Log In** with your credentials.  
4. Begin using MyGarden Planner immediately—--no installation necessary.

---

## Usage
(#usage)

### Dashboard
(#dashboard)

- **Plant Count**: Displays the total number of plants in your library.  
- **Upcoming Tasks**: Lists tasks due soon (e.g., watering, fertilising).  
- **Recent Activity**: Shows recent plant additions and notifications.  
- **Navigation**: Use the sidebar to jump to other sections (Plant Library, Planner, etc.).

### Plant Library
(#plant-library)  

- **Add Plant**: In the search field at the top, type the plant’s common name and press **Enter** or click **Add Plant**.  
- **Upload Photo**: On each plant card, click **Upload Photo**, select a JPG or PNG image and confirm.  
- **Notes**: Click the **Notes** icon to add or edit notes about the plant’s growth and progress.  
- **Remove Plant**: Click the red **Remove** button on a card to delete that plant from your library.

### Planner
(#planner)

- **Create Task**: Click **Add Task**, select a plant (or choose “General”), select a task type (e.g., Watering, Fertilising), pick a due date from the date picker (formatted as DD/MM/YYYY), and click **Save**.  
- **View & Delete Tasks**: Tasks appear as cards listing task type, associated plant, and due date. Click **Delete** to remove a task.  
- **Date Format**: Dates consistently display as **DD/MM/YYYY** to match British English conventions.

### Profile
(#profile)

- **Edit Profile**: Update your **Username**, **Full Name** and **Avatar URL**, then click **Save Changes**.  
- **Dark Mode**: Toggle **Switch to Dark Mode** to change themes; preference is saved in localStorage.  
- **Social Section**: View **Followers** and **Following** lists with avatars and usernames. Click any avatar to view that user’s public profile (future feature).

### Community Forum
(#community-forum)

- **Create Post**: Enter a text caption in the input box and optionally click **Upload Photo** to add an image. Click **Post to Forum** when ready.  
- **Like / Unlike**: Click the **Like** button beneath a post; the like count updates in real time.  
- **Comments**: Click **Comments** to expand the comment thread; type your message and press **Post**.  
- **Follow / Unfollow**: On any post, click **Follow** to follow the author; button toggles to **Unfollow**.  
- **Real-Time Updates**: Likes and comments appear immediately via Supabase Realtime.

### Inbox (Notifications)
(#inbox-notifications)

- **View Notifications**: Shows who liked your post, commented, or followed you. Each notification displays:  
- Actor’s avatar and username  
- Type of interaction (e.g., “liked your post”)  
- Timestamp (DD/MM/YYYY HH:MM)  
- **Delete Notification**: Click the **Delete** button on a notification to remove it.

### Settings
(#settings)

- **Change Password**: Enter a new password and click **Save**. A confirmation message appears if successful.  
- **Delete Account**: Click **Delete Account** to permanently remove all your data (plants, tasks, posts, comments, likes, follows) and sign you out.  
- **Help & Feedback**: Submit bug reports or feature requests via the form. Support emails are sent to support@mygardenplanner.com.

---

## Project Structure
(#project-structure)


**MyGarden-Planner/**  
- **public/**  
  - `index.html`  

- **src/**  
  - **api/**  
    - `supabaseClient.js`  
      - Initialises Supabase connection  
  - **components/**  
    - `Navbar.jsx`  
      - Sidebar navigation  
    - `PlantCard.jsx`  
      - Plant display cards (image, name, notes, controls)  
    - `TaskCard.jsx`  
      - Task cards (task type, plant name, due date, delete button)  
    - `PostCard.jsx`  
      - Forum post cards (caption, optional image, like/comment/follow buttons)  
    - `CommentCard.jsx`  
      - Individual comment display under forum posts  
    - …other reusable components (buttons, form inputs, etc.)  
  - **pages/**  
    - `Dashboard.jsx`  
      - Home/dashboard overview: plant count, upcoming tasks, recent activity  
    - `PlantLibrary.jsx`  
      - Plant library page: add/remove plants, upload photos, add notes  
    - `Planner.jsx`  
      - Task planner page: create/view/delete tasks (watering, fertilising, etc.)  
    - `Profile.jsx`  
      - User profile page: edit username, avatar, dark mode, view followers/following  
    - `Settings.jsx`  
      - Account settings page: change password, delete account, submit feedback  
    - `Forum.jsx`  
      - Community forum page: create posts, view/like/comment, follow users  
    - `Notifications.jsx`  
      - Inbox/notifications page: list likes, comments, new followers  
    - `About.jsx`  
      - About/help page: app overview, usage tips  
    - `Login.jsx`  
      - Login/Signup page: email/password authentication  

  - **styles/**  
    - `styles.css`  
      - Global CSS (green/khaki theme, dark mode variations, responsive layouts)  

  - `App.jsx`  
    - Main application component: routing and overall layout  
  - `main.jsx`  
    - Vite entry point: renders `<App />` into `index.html`  

- `.env`  
  - Environment variables (Supabase URL and Anon Key) – **these do not commit**  
- `package.json`  
  - Project metadata, dependencies, and scripts  
- `vite.config.js`  
  - Vite build configuration (aliases, plugins)  
- `README.md`  
  - This file  



---

## Contributing 
(#contributing)

*We welcome any improvements to MyGarden Planner! Please follow these steps to submit your changes*:

1. **Fork the repository**
   Click the **Fork** button on the GitHub project page to create your own copy.

2. **Clone your fork locally**
   git clone https://github.com/YourUsername/MyGarden-Planner.git
   cd MyGarden-Planner

3. **Install dependencies**
   npm install

4. **Create a feature branch**
   git checkout -b feature/your-feature-name

5. **Make your changes**
   - Adhere to the existing file structure and coding style.
   - Write clear, concise commit messages that explain why you made each change.

6. **Commit your changes**
   git add .
   git commit -m "<short description of change>"

7. **Push to your fork**
   git push origin feature/your-feature-name

8. **Open a Pull Request**
   - Go to the original repository on GitHub.
   - Click Pull requests -> New pull request, then choose your feature branch.
   - Provide a descriptive title and a brief summary of what you’ve implemented or fixed.

**Guidelines**

- **Linting & Formatting**
  Ensure your code passes existing linting checks. Run npm run lint and correct any errors before committing.

- **Testing**
  If you add new features, please include unit tests. Place test files alongside the component or function you’ve updated.

- **Documentation**
  Update relevant documentation (e.g., README or inline comments) to reflect any new behaviour or configuration options.

- **Keep Pull Requests Focused**
  One feature or fix per pull request helps reviewers provide quicker, more precise feedback.

*Thank you for improving MyGarden Planner! Your contributions help make this project better for everyone.*
