# Obsidian Wiki Template
Welcome to Obsidian Wiki Template!

This is a personal wiki or note-taking system template based on [Obsidian](https://obsidian.md/) which works on top of a local folder of plain text Markdown files. Obsidian is a really powerful software that helps manage our notes and build the connections between them. There are a bunch of settings we need to do before we can actually get the best experience in Obsidian. However, with this template, you don't need to start your Obsidian-based wiki system from scratch.

(If you are reading this README file in Obsidian, use `Ctrl + E` to toggle edit/preview mode)

![obsidian_window](asserts/obsidian_window.png)

## Quick Start

Obsidian will store your notes in a **vault** which is actually the base folder of the wiki system. Besides your notes, there are also all of its settings files, CSS, trash folder, and any sub-folders and attachments.

**To use this template vault, you need to install Obsidian first.** Download from Obsidian home page, and open this template vault. Safe mode is on when you open a vault for the first time, which prevents us from using many useful community plugins (see details in section [Known Issues in Obsidian](#Known-Issues-in-Obsidian)). We need to turn it off and toggle all the community plugins in order to use them. After that, explore what we can do in Obsidian and start your wiki system!

This template contains config files that I'm using for my own wiki system. All the config files are stored under the hidden folder `.obsidian`. See section [`Config`](#config) for more details.

If you're new to Obsidian, take a look at [features](https://obsidian.md/features). You can also press `F1` in Obsidian to open the help vault and explore the help vault for features that you are interested in.  This template shows some interesting features for you in the file [Examples](Examples.md). 

The following videos to get better understanding of Obsidian usage.

- [Obsidian Tour with Bryan Jenks](https://www.youtube.com/watch?v=GurXxeaq68o)
- [My 2020 Comprehensive Obsidian Workflow For Zettelkasten and Evergreen Notes](https://www.youtube.com/watch?v=Ewhfok91AdE)
- [Here Is How I Use Tags And Links In Obsidian To Manage My Zettelkasten](https://www.youtube.com/watch?v=zIh1S7ra3aI)

Remember, Obsidian is just a software tool that can be used in many ways, from a simple list of notes to a very powerful knowledge management system. Your wiki system is useful only when you manage them in a proper manner. Take some time to think about how to take smart notes. The book [How to Take Smart Notes](https://takesmartnotes.com/) may be helpful.

## Settings

Besides our notes, all settings are stored under the folder `.obsidian` including built-in plugin settings, downloaded community plugins, workspace layouts, hotkeys, etc. Let's take a look at what's inside this folder:

- `plugins/` is the folder contains downloaded community plugins.
- `config` stores most setting parameters like whether or not enable a plugin, hotkeys, and some other parameters.
- `workspace` stores our workspace layouts. You can treat it as the layout of the home page you would like to see when you open your vault in Obsidian. This file will be updated most frequently even you just open a new file and close Obsidian.

**Obsidian will update these files in sync, so if you don't want to frequently commit changes on these settings, you should to update these files manually.** It is recommended to put the file `workspace` (and perhaps `config` as well) into `.gitignore` once you commit your favourite layout.

## Useful Hotkeys

Some useful hotkeys used in this template (customized means this is my personal setting):

| Hotkey names                                                 | Hotkey settings         |
| ------------------------------------------------------------ | ----------------------- |
| Insert template                                              | `ctrl + T`              |
| Search current file                                          | `Ctrl + F`              |
| Search in all files                                          | `Ctrl + Shift + F`      |
| Focus on pane to the left                                    | `Alt + <-` (customized) |
| Focus on pane to the right                                   | `Alt + ->` (customized) |
| Open command palette                                         | `Ctrl + P`              |
| Toggle edit/preview mode                                     | `Ctrl + E`              |
| Close active pane                                            | `Ctrl + W`              |
| Emoji Toolbar: Open emoji picker                             | `Ctrl + [` (customized) |
| Wikilinks to MDLinks: Toggle selected wikilink to markdown link and vice versa | `Ctrl + Shift + L`      |
| Toggle bold for selection                                    | `Ctrl + B`              |

- Opening a note with `Ctrl` key will open it in a new pane.
- `Shift + Scroll wheel` to scroll between all opened notes.


## Useful Plugins

This template uses the following built-in core plugins and community plugins:

- Core plugins (only the most useful ones)
  - Templates (use custom templates under `Templates` folder to reduce your efforts to take notes)
  - Daily notes (create today's daily note with only one click)
  - Slides (make fast presentation)
  - Graph view (explore connections between notes)
- Community plugins
  - Checklist (combines checklists accross pages into user's sidebar)
  - Copy button for code blocks
  - Emoji Toolbar (find and input emoji quickly)
  - Sliding Panes (explore multiple notes fast and smoothly)
  - Wikilinks to MDLinks (very useful if you want to switch links between `[[link]]` and `[link](./path/to/file)`)

## Known Issues in Obsidian

Even though Obsidian is a great choice for building our wiki system, it actually has some little issues to resolve.

### Local images in HTML format cannot be displayed correctly

We like the syntax `<img src="">` because we can scale images more easily. In Obsidian, `<img src="">` cannot be used to display local images. But it can still be used for online image (images in Github repo failed) . See the examples below.

```markdown
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1280px-Image_created_with_a_mobile_phone.png" width="50%" alt="example image from Wikipedia">
```

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1280px-Image_created_with_a_mobile_phone.png" width="50%" alt="example image from Wikipedia">

```markdown
<img src="https://github.com/Magic-wei/obsidian_wiki_template/blob/main/asserts/example_image.svg" width="50%" alt="example_image from Github repo">
```

<img src="https://github.com/Magic-wei/obsidian_wiki_template/blob/main/asserts/example_image.svg" width="50%" alt="example_image from Github repo">

```markdown
<img src="./asserts/example_image.svg" width="50%" alt="example_image from local file">
```

<img src="./asserts/example_image.svg" width="50%" alt="example_image from local file">

Solution is, we use table to help us arrange images. There is a template file named `Two-Column Images` which we can use to resize image to 50% width. This should work well in most cases.

```markdown
| Left | Right |
|-----|-----|
|![[example_image.svg]]|![example_image.svg](example_image.svg)|
```

| Left | Right |
|-----|-----|
|![[example_image.svg]]|![example_image.svg](./asserts/example_image.svg)|

### Safe mode is on every time we clone and open the vault for the first time

Safe mode will be initialized to `ON` every time we clone and open the vault for the first time on a new PC. This doesn't happen that much actually.

Solution is:

1. Back up `.obsidian/config` and `.obsidian/workspace` before we clone and open the vault for the first time. 
2. Open the vault and turn off safe mode. 
3. Restore these two files with backup. Everything will be exactly what it was.



## Credits

- **Shida Li** and **Erica Xu** for their excellent works on [Obsidian](https://obsidian.md/).
- **Bryan Jenks** for his wonderful and elaborated videos about how to take notes in Obsidian.