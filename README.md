wpBase
===

wpBase is a base theme for wordpress based upon [underscores](https://github.com/Automattic/_s) from Automattic. It incorporates base sass styling using the [itcss](https://www.creativebloq.com/web-design/manage-large-css-projects-itcss-101517528) architecture and a [gulp](https://gulpjs.com/) based task runner. To get started, download the latest commit zip file and extract it to the theme directory of the site you are working on, then:
1. Find and replace all instances of 'wpbase' in the project with your theme name.
2. Replace "http://wp-test.local" in 'gulpfile.babel.js' with the vhost domain of the local site you are developing on.
3. Run the command `npm install` from the root directory.

Once that is done working with the theme is simple.
- To develop run the command `npm start` which will spin up a browsersync instance of the site and reload the page whenever you make a change.
- Once you have finished developing and want to push up to a live site simply run `npn run build` and it will compile all static files and generate a zip file of the theme in the 'bundled' directory which can be uploaded directly to wordpress.
