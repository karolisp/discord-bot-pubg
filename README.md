# PUBG-PT

### What is this repository for?

This is the main discord bot repository.

### How do I get set up?

Don't be a crybaby: clone, install and run the commands

## How to run this app

1. Clone this repository: `git clone git@github.com:antoniojps/discord-bot-pubg.git`
2. `cd discord-bot-pubg`
3. `yarn install`
4. `tsc -w` and `yarn start`

## Available commands

| Command      | Description                                                      |
| :----------- | :--------------------------------------------------------------- |
| `yarn start:dev` | Create an optimized bundle and serve with the dev server. |
| `yarn start` | Create an optimized bundle and serve with the production server. |

## Bot

This bot aims to be used in the PUBG LT discord community. It supports automatic role update on presence change

### Server installation

Add the bot the server, to do so visit the link: `https://discord.com/oauth2/authorize?client_id=883630850317631498&scope=bot`

### Available commands

| Command                          | Channel            | Description                                                                                                                                                         |
|----------------------------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `lfs` or `lfs "note"`            | `LFS_CHANNEL_ID`   | Creates a LFS embed with a possible note                                                                                                                                                |
| `-`                              | `LFS_CHANNEL_ID`   | Deletes the last LFS embed of the author                                                                                                                            |
| `/link PUBG_NICKNAME`            | `ROLES_CHANNEL_ID` | Assigns a pubg nickname to the author and roles according to stats                                                                                                  |
| `/role "ROLE_NAME"`            | `ROLES_CHANNEL_ID` | Assigns a free agent role to user                                                                                                  |
| `/update`                        | `ROLES_CHANNEL_ID` | Updates user pubg stats for users already linked                                                                                                                    |
| `/link PUBG_NICKNAME DISCORD_ID` | `ADMIN_CHANNEL_ID` | Assigns a pubg nickname to the user of the discord id and roles according to stats, if someone is linked to that pubg account he will be unlinked and roles removed |
| `/unlink PUBG_NICKNAME`          | `ADMIN_CHANNEL_ID` | If someone is linked to that pubg account he will be unlinked and roles removed                                                                                     |
| `/help`                          | `LFS_CHANNEL_ID`, `ROLES_CHANNELL_ID`, `ADMIN_CHANNEL_ID`      | Sends a PM to the User with a General Guide to the bot commands, or sends message with help commands.                       |
| `/order`                          | any      | Sends a "ORDER" gif                     |

### Triggers
If someone uses lousy words the bot will reply with a notice.

### Usage

The first thing a user must do is link their discord account to a pubg account by linking them, this will assign him roles according to stats and rank, once that's done he can join the rooms according to stats. He can also use the LFS channel with a more detailed embed.

### 1. Link

`/link PUBG_NAME`

This command will fetch the users stats directly from the PUBG API there's a minimum of 20 games required in order to provide the roles.

`/link PUBG_NAME DISCORD_ID`

Admin command, same as previous but assigns the stats of the PUBG_NAME to the user of the DISCORD_ID. Used to avoid false linking.

**Roles**
| Role(s) | Description |
|:-----------------|:-------------|
| `Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Master` | Role according to rank. |
| `KD 0.5`, `KD 1`, `KD 1.5`, `KD 2`, `KD 2.5`, `KD 3`, `KD 3.5`, `KD 4`, `KD 4.5`, `KD 5`, `KD +6` | Role according to KD. |
| `100 ADR`, `150 ADR`, `200 ADR`, `250 ADR`, `300 ADR`, `350 ADR`, `400 ADR`, `450 ADR`, `500 ADR`, `+550 ADR` | Role according to ADR. |

### 2. Looking for someone

`lfs`

By typing `lfs` on the `looking-for-someone` channel the bot will create a LFS Embed, if someone reacts with a `✉️` it will send a PM to the author of the `lfs` with the request, the author can accept or decline the request and the interested party will be notified with a PM.

### 3. Help

`/help`

Typing `help` on any channel the bot will delete the message sent by the user, create an Embed with a guide to all the bot commands and send it via PM.
