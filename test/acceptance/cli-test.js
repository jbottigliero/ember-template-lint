import fs from 'node:fs';
import path from 'node:path';

import Project from '../helpers/fake-project.js';
import run from '../helpers/run.js';
import setupEnvVar from '../helpers/setup-env-var.js';

const ROOT = process.cwd();

describe('ember-template-lint executable', function () {
  setupEnvVar('FORCE_COLOR', '0');
  setupEnvVar('LC_ALL', 'en_US');

  // Fake project
  let project;
  beforeEach(async function () {
    project = await Project.defaultSetup();
    await project.chdir();
  });

  afterEach(function () {
    project.dispose();
  });

  describe('basic usage', function () {
    setupEnvVar('CI', null);
    setupEnvVar('GITHUB_ACTIONS', null);

    describe('without any parameters', function () {
      it('should emit help text', async function () {
        let result = await run([]);

        expect(result.exitCode).toEqual(1);
        expect(result.stderr).toMatchInlineSnapshot(`
          "ember-template-lint [options] [files..]

          Options:
            --config-path               Define a custom config path
                                                 [string] [default: \\".template-lintrc.js\\"]
            --config                    Define a custom configuration to be used - (e.g.
                                        '{ \\"rules\\": { \\"no-implicit-this\\": \\"error\\" } }')
                                                                                  [string]
            --quiet                     Ignore warnings and only show errors     [boolean]
            --rule                      Specify a rule and its severity to add that rule t
                                        o loaded rules - (e.g. \`no-implicit-this:error\` or
                                         \`rule:[\\"error\\", { \\"allow\\": [\\"some-helper\\"] }]\`)
                                                                                  [string]
            --filename                  Used to indicate the filename to be assumed for co
                                        ntents from STDIN                         [string]
            --fix                       Fix any errors that are reported as fixable
                                                                [boolean] [default: false]
            --format                    Specify format to be used in printing output
                                                              [string] [default: \\"pretty\\"]
            --output-file               Specify file to write report to           [string]
            --verbose                   Output errors with source description    [boolean]
            --working-directory, --cwd  Path to a directory that should be considered as t
                                        he current working directory.
                                                                   [string] [default: \\".\\"]
            --no-config-path            Does not use the local template-lintrc, will use a
                                         blank template-lintrc instead           [boolean]
            --update-todo               Update list of linting todos by transforming lint
                                        errors to todos         [boolean] [default: false]
            --include-todo              Include todos in the results
                                                                [boolean] [default: false]
            --clean-todo                Remove expired and invalid todo files
                                                                 [boolean] [default: true]
            --compact-todo              Compacts the .lint-todo storage file, removing ext
                                        raneous todos                            [boolean]
            --todo-days-to-warn         Number of days after its creation date that a todo
                                         transitions into a warning               [number]
            --todo-days-to-error        Number of days after its creation date that a todo
                                         transitions into an error                [number]
            --ignore-pattern            Specify custom ignore pattern (can be disabled wit
                                        h --no-ignore-pattern)
                        [array] [default: [\\"**/dist/**\\",\\"**/tmp/**\\",\\"**/node_modules/**\\"]]
            --no-inline-config          Prevent inline configuration comments from changin
                                        g config or rules                        [boolean]
            --print-config              Print the configuration for the given file
                                                                [boolean] [default: false]
            --max-warnings              Number of warnings to trigger nonzero exit code
                                                                                  [number]
            --help                      Show help                                [boolean]
            --version                   Show version number                      [boolean]"
        `);
      });
    });

    describe('with --help', function () {
      it('should emit help text', async function () {
        let result = await run(['--help']);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toMatchInlineSnapshot(`
          "ember-template-lint [options] [files..]

          Options:
            --config-path               Define a custom config path
                                                 [string] [default: \\".template-lintrc.js\\"]
            --config                    Define a custom configuration to be used - (e.g.
                                        '{ \\"rules\\": { \\"no-implicit-this\\": \\"error\\" } }')
                                                                                  [string]
            --quiet                     Ignore warnings and only show errors     [boolean]
            --rule                      Specify a rule and its severity to add that rule t
                                        o loaded rules - (e.g. \`no-implicit-this:error\` or
                                         \`rule:[\\"error\\", { \\"allow\\": [\\"some-helper\\"] }]\`)
                                                                                  [string]
            --filename                  Used to indicate the filename to be assumed for co
                                        ntents from STDIN                         [string]
            --fix                       Fix any errors that are reported as fixable
                                                                [boolean] [default: false]
            --format                    Specify format to be used in printing output
                                                              [string] [default: \\"pretty\\"]
            --output-file               Specify file to write report to           [string]
            --verbose                   Output errors with source description    [boolean]
            --working-directory, --cwd  Path to a directory that should be considered as t
                                        he current working directory.
                                                                   [string] [default: \\".\\"]
            --no-config-path            Does not use the local template-lintrc, will use a
                                         blank template-lintrc instead           [boolean]
            --update-todo               Update list of linting todos by transforming lint
                                        errors to todos         [boolean] [default: false]
            --include-todo              Include todos in the results
                                                                [boolean] [default: false]
            --clean-todo                Remove expired and invalid todo files
                                                                 [boolean] [default: true]
            --compact-todo              Compacts the .lint-todo storage file, removing ext
                                        raneous todos                            [boolean]
            --todo-days-to-warn         Number of days after its creation date that a todo
                                         transitions into a warning               [number]
            --todo-days-to-error        Number of days after its creation date that a todo
                                         transitions into an error                [number]
            --ignore-pattern            Specify custom ignore pattern (can be disabled wit
                                        h --no-ignore-pattern)
                        [array] [default: [\\"**/dist/**\\",\\"**/tmp/**\\",\\"**/node_modules/**\\"]]
            --no-inline-config          Prevent inline configuration comments from changin
                                        g config or rules                        [boolean]
            --print-config              Print the configuration for the given file
                                                                [boolean] [default: false]
            --max-warnings              Number of warnings to trigger nonzero exit code
                                                                                  [number]
            --help                      Show help                                [boolean]
            --version                   Show version number                      [boolean]"
        `);
      });
    });

    describe('with non-existent options', function () {
      it('should exit with failure with one-word option', async function () {
        const result = await run(['--fake']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toMatchInlineSnapshot(`"Unknown option: --fake"`);
      });

      it('should exit with failure with multi-word option name', async function () {
        const result = await run(['--fake-option-name']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toMatchInlineSnapshot(`"Unknown option: --fake-option-name"`);
      });

      it('should exit with failure with camelcase name', async function () {
        const result = await run(['--fakeOptionName']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toMatchInlineSnapshot(`"Unknown option: --fakeOptionName"`);
      });
    });
  });

  describe('reading files', function () {
    describe('given path to non-existing file', function () {
      it('should exit with error', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['app/templates/application-1.hbs']);

        expect(result.exitCode).toEqual(1, 'exits with error');
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toEqual(
          'No files matching the pattern were found: "app/templates/application-1.hbs"'
        );
      });
    });

    describe('given path to single file with errors', function () {
      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['app/templates/application.hbs']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });

      it('when using custom working directory', async function () {
        await process.chdir(ROOT);

        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });

        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(
          ['--working-directory', project.baseDir, 'app/templates/application.hbs'],
          {
            // run from ember-template-lint's root (forces `--working-directory` to be used)
            cwd: ROOT,
          }
        );

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toMatchInlineSnapshot(`
          "app/templates/application.hbs
            1:4  error  Non-translated string used  no-bare-strings
            1:25  error  Non-translated string used  no-bare-strings

          ✖ 2 problems (2 errors, 0 warnings)"
        `);
        expect(result.stderr).toMatchInlineSnapshot('""');
      });
    });

    describe('given path to single file with custom extension with errors', function () {
      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.fizzle': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
            },
          },
        });

        let result = await run(['app/templates/application.fizzle']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });
    });

    describe('given wildcard path resolving to single file', function () {
      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['app/templates/*']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });

      it('when using custom working directory', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });

        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['--working-directory', project.baseDir, 'app/templates/*'], {
          // run from ember-template-lint's root (forces `--working-directory` to be used)
          cwd: ROOT,
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toMatchInlineSnapshot(`
          "app/templates/application.hbs
            1:4  error  Non-translated string used  no-bare-strings
            1:25  error  Non-translated string used  no-bare-strings

          ✖ 2 problems (2 errors, 0 warnings)"
        `);
        expect(result.stderr).toMatchInlineSnapshot('""');

        // SAME TEST, USING ALIAS AS OPTION NAME:

        result = await run(['--cwd', project.baseDir, 'app/templates/*'], {
          // run from ember-template-lint's root (forces `--working-directory` to be used)
          cwd: ROOT,
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toMatchInlineSnapshot(`
          "app/templates/application.hbs
            1:4  error  Non-translated string used  no-bare-strings
            1:25  error  Non-translated string used  no-bare-strings

          ✖ 2 problems (2 errors, 0 warnings)"
        `);
        expect(result.stderr).toMatchInlineSnapshot('""');

        // SAME TEST, USING CAMELCASE VERSION OF OPTION NAME:

        result = await run(['--workingDirectory', project.baseDir, 'app/templates/*'], {
          // run from ember-template-lint's root (forces `--working-directory` to be used)
          cwd: ROOT,
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toMatchInlineSnapshot(`
          "app/templates/application.hbs
            1:4  error  Non-translated string used  no-bare-strings
            1:25  error  Non-translated string used  no-bare-strings

          ✖ 2 problems (2 errors, 0 warnings)"
        `);
        expect(result.stderr).toMatchInlineSnapshot('""');
      });
    });

    describe('given directory path', function () {
      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['app']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toMatchInlineSnapshot(`
          "app/templates/application.hbs
            1:4  error  Non-translated string used  no-bare-strings
            1:25  error  Non-translated string used  no-bare-strings

          ✖ 2 problems (2 errors, 0 warnings)"
        `);
        expect(result.stderr).toBeFalsy();
      });
    });

    describe('given path to single file without errors', function () {
      it('should exit without error and any console output', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': false,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs':
                '<h2>Love for bare strings!!!</h2> <div>Bare strings are great!</div>',
            },
          },
        });

        let result = await run(['app/templates/application.hbs']);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toBeFalsy();
      });
    });
  });

  describe('reading from stdin', function () {
    describe('given no path', function () {
      setupEnvVar('CI', null);
      setupEnvVar('GITHUB_ACTIONS', null);

      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run([], {
          shell: false,
          input: fs.readFileSync(path.resolve('app/templates/application.hbs')),
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeFalsy();
        expect(result.stderr).toMatchInlineSnapshot(`
          "ember-template-lint [options] [files..]

          Options:
            --config-path               Define a custom config path
                                                 [string] [default: \\".template-lintrc.js\\"]
            --config                    Define a custom configuration to be used - (e.g.
                                        '{ \\"rules\\": { \\"no-implicit-this\\": \\"error\\" } }')
                                                                                  [string]
            --quiet                     Ignore warnings and only show errors     [boolean]
            --rule                      Specify a rule and its severity to add that rule t
                                        o loaded rules - (e.g. \`no-implicit-this:error\` or
                                         \`rule:[\\"error\\", { \\"allow\\": [\\"some-helper\\"] }]\`)
                                                                                  [string]
            --filename                  Used to indicate the filename to be assumed for co
                                        ntents from STDIN                         [string]
            --fix                       Fix any errors that are reported as fixable
                                                                [boolean] [default: false]
            --format                    Specify format to be used in printing output
                                                              [string] [default: \\"pretty\\"]
            --output-file               Specify file to write report to           [string]
            --verbose                   Output errors with source description    [boolean]
            --working-directory, --cwd  Path to a directory that should be considered as t
                                        he current working directory.
                                                                   [string] [default: \\".\\"]
            --no-config-path            Does not use the local template-lintrc, will use a
                                         blank template-lintrc instead           [boolean]
            --update-todo               Update list of linting todos by transforming lint
                                        errors to todos         [boolean] [default: false]
            --include-todo              Include todos in the results
                                                                [boolean] [default: false]
            --clean-todo                Remove expired and invalid todo files
                                                                 [boolean] [default: true]
            --compact-todo              Compacts the .lint-todo storage file, removing ext
                                        raneous todos                            [boolean]
            --todo-days-to-warn         Number of days after its creation date that a todo
                                         transitions into a warning               [number]
            --todo-days-to-error        Number of days after its creation date that a todo
                                         transitions into an error                [number]
            --ignore-pattern            Specify custom ignore pattern (can be disabled wit
                                        h --no-ignore-pattern)
                        [array] [default: [\\"**/dist/**\\",\\"**/tmp/**\\",\\"**/node_modules/**\\"]]
            --no-inline-config          Prevent inline configuration comments from changin
                                        g config or rules                        [boolean]
            --print-config              Print the configuration for the given file
                                                                [boolean] [default: false]
            --max-warnings              Number of warnings to trigger nonzero exit code
                                                                                  [number]
            --help                      Show help                                [boolean]
            --version                   Show version number                      [boolean]"
        `);
      });
    });

    describe('given no path with --filename', function () {
      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['--filename', 'app/templates/application.hbs'], {
          shell: false,
          input: fs.readFileSync(path.resolve('app/templates/application.hbs')),
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });
    });

    describe('given - (stdin) path', function () {
      // there is no such path on Windows OS
      if (process.platform === 'win32') {
        return;
      }

      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['-', '<', 'app/templates/application.hbs'], {
          shell: true,
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });
    });

    describe('given /dev/stdin path', function () {
      // there is no such path on Windows OS
      if (process.platform === 'win32') {
        return;
      }

      it('should print errors', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
              components: {
                'foo.hbs': '{{fooData}}',
              },
            },
          },
        });

        let result = await run(['/dev/stdin', '<', 'app/templates/application.hbs'], {
          shell: true,
        });

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toBeTruthy();
        expect(result.stderr).toBeFalsy();
      });
    });
  });

  describe('errors and warnings formatting', function () {
    it('should be able run a rule passed in (rule:warn)', async function () {
      await project.setConfig({
        rules: {
          'no-bare-strings': true,
          'no-html-comments': true,
        },
      });
      await project.write({
        app: {
          templates: {
            'application.hbs':
              '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
          },
        },
      });

      let result = await run(['.', '--no-config-path', '--rule', 'no-html-comments:warn']);

      expect(result.exitCode).toEqual(0);
      expect(result.stdout.split('\n')).toEqual([
        'app/templates/application.hbs',
        '  1:53  warning  HTML comment detected  no-html-comments',
        '',
        '✖ 1 problems (0 errors, 1 warnings)',
      ]);
      expect(result.stderr).toBeFalsy();
    });

    it('should be able run a rule passed in (rule:error)', async function () {
      await project.setConfig({
        rules: {
          'no-bare-strings': true,
          'no-html-comments': true,
        },
      });
      await project.write({
        app: {
          templates: {
            'application.hbs':
              '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
          },
        },
      });

      let result = await run(['.', '--no-config-path', '--rule', 'no-html-comments:error']);

      expect(result.exitCode).toEqual(1);
      expect(result.stdout.split('\n')).toEqual([
        'app/templates/application.hbs',
        '  1:53  error  HTML comment detected  no-html-comments',
        '',
        '✖ 1 problems (1 errors, 0 warnings)',
      ]);
      expect(result.stderr).toBeFalsy();
    });

    it('should be able run a rule passed in (rule:[warn, config])', async function () {
      await project.setConfig({
        rules: {
          'no-bare-strings': true,
          'no-html-comments': true,
        },
      });
      await project.write({
        app: {
          templates: {
            'application.hbs':
              '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
          },
        },
      });

      let result = await run([
        '.',
        '--no-config-path',
        '--rule',
        'no-html-comments:["warn", true]',
      ]);

      expect(result.exitCode).toEqual(0);
      expect(result.stdout.split('\n')).toEqual([
        'app/templates/application.hbs',
        '  1:53  warning  HTML comment detected  no-html-comments',
        '',
        '✖ 1 problems (0 errors, 1 warnings)',
      ]);
      expect(result.stderr).toBeFalsy();
    });

    it('should be able run a rule passed in (rule:[error, config])', async function () {
      await project.setConfig({
        rules: {
          'no-bare-strings': true,
          'no-html-comments': true,
        },
      });
      await project.write({
        app: {
          templates: {
            'application.hbs':
              '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
          },
        },
      });

      let result = await run([
        '.',
        '--no-config-path',
        '--rule',
        'no-html-comments:["error", true]',
      ]);

      expect(result.exitCode).toEqual(1);
      expect(result.stdout.split('\n')).toEqual([
        'app/templates/application.hbs',
        '  1:53  error  HTML comment detected  no-html-comments',
        '',
        '✖ 1 problems (1 errors, 0 warnings)',
      ]);
      expect(result.stderr).toBeFalsy();
    });

    describe('with/without --ignore-pattern', function () {
      it('should respect dirs ignored by default', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
            'no-html-comments': true,
          },
        });
        await project.write({
          app: {
            dist: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
            'other.hbs': '<div></div>',
          },
        });

        let result = await run(['app/**/*']);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toEqual('');
        expect(result.stderr).toBeFalsy();
      });

      it('should allow to pass custom ignore pattern', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
            'no-html-comments': true,
          },
        });
        await project.write({
          app: {
            foo: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
            bar: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
            'other.hbs': '<div></div>',
          },
        });

        let result = await run([
          'app/**/*',
          '--ignore-pattern',
          '**/foo/**',
          '--ignore-pattern',
          '**/bar/**',
        ]);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toEqual('');
        expect(result.stderr).toBeFalsy();
      });

      it('should fail when no files match because of ignore pattern', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
          },
        });
        await project.write({
          app: {
            foo: {
              'application.hbs': 'Bare strings are bad',
            },
          },
        });

        let result = await run(['app/**/*', '--ignore-pattern', '**/foo/**']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toEqual('');
        expect(result.stderr).toEqual('No files matching the pattern were found: "app/**/*"');
      });

      it('should allow to disable dirs ignored by default', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': true,
            'no-html-comments': true,
          },
        });
        await project.write({
          app: {
            dist: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
          },
        });

        let result = await run(['app/**/*', '--no-ignore-pattern']);

        expect(result.exitCode).toEqual(1);
        expect(result.stdout).toEqual(
          `app/dist/application.hbs
  1:4  error  Non-translated string used  no-bare-strings
  1:24  error  Non-translated string used  no-bare-strings
  1:53  error  HTML comment detected  no-html-comments

✖ 3 problems (3 errors, 0 warnings)`
        );

        expect(result.stderr).toBeFalsy();
      });
    });

    describe('with --config-path param', function () {
      describe('able to await run only limited subset of rules', function () {
        it('should skip disabled rules from subset', async function () {
          project.write({
            'temp-templatelint-rc.js':
              'module.exports = { rules: { "no-shadowed-elements": false } };',
            'application.hbs': '{{#let "foo" as |div|}}<div>boo</div>{{/let}}',
          });
          let result = await run(['.', '--config-path', 'temp-templatelint-rc.js']);

          expect(result.exitCode).toEqual(0);
          expect(result.stdout).toBeFalsy();
          expect(result.stderr).toBeFalsy();
        });

        it('should load only one rule and print error message', async function () {
          project.write({
            'temp-templatelint-rc.js':
              'module.exports = { rules: { "no-shadowed-elements": true } };',
            'template.hbs': '{{#let "foo" as |div|}}<div>boo</div>{{/let}}',
          });
          let result = await run(['.', '--config-path', 'temp-templatelint-rc.js']);

          expect(result.exitCode).toEqual(1);
          expect(result.stdout.split('\n')).toEqual([
            'template.hbs',
            '  1:23  error  Ambiguous element used (`div`)  no-shadowed-elements',
            '',
            '✖ 1 problems (1 errors, 0 warnings)',
          ]);
          expect(result.stderr).toBeFalsy();
        });
      });

      describe('given a working-directory with errors and a lintrc with rules', function () {
        it('should print properly formatted error messages', async function () {
          await project.setConfig({
            rules: {
              'no-bare-strings': false,
            },
          });
          await project.write({
            app: {
              templates: {
                'application.hbs':
                  '<h2>Love for bare strings!!!</h2> <div>Bare strings are great!</div>',
              },
            },
            'other-file.js': "module.exports = { rules: { 'no-bare-strings': true } };",
          });

          let result = await run(
            [
              '--working-directory',
              project.baseDir,
              '--config-path',
              project.path('other-file.js'),
              '.',
            ],
            {
              // run from ember-template-lint's root (forces `--working-directory` to be used)
              cwd: ROOT,
            }
          );

          expect(result.exitCode).toEqual(1);
          expect(result.stdout.split('\n')).toEqual([
            'app/templates/application.hbs',
            '  1:4  error  Non-translated string used  no-bare-strings',
            '  1:39  error  Non-translated string used  no-bare-strings',
            '',
            '✖ 2 problems (2 errors, 0 warnings)',
          ]);
          expect(result.stderr).toBeFalsy();
        });
      });

      describe('given a directory with errors and a lintrc with rules', function () {
        it('should print properly formatted error messages', async function () {
          await project.setConfig({
            rules: {
              'no-bare-strings': false,
            },
          });
          await project.write({
            app: {
              templates: {
                'application.hbs':
                  '<h2>Love for bare strings!!!</h2> <div>Bare strings are great!</div>',
              },
            },
            'other-file.js': "module.exports = { rules: { 'no-bare-strings': true } };",
          });

          let result = await run(['.', '--config-path', project.path('other-file.js')]);

          expect(result.exitCode).toEqual(1);
          expect(result.stdout.split('\n')).toEqual([
            'app/templates/application.hbs',
            '  1:4  error  Non-translated string used  no-bare-strings',
            '  1:39  error  Non-translated string used  no-bare-strings',
            '',
            '✖ 2 problems (2 errors, 0 warnings)',
          ]);
          expect(result.stderr).toBeFalsy();
        });
      });

      describe('given a directory with errors but a lintrc without any rules', function () {
        it('should exit without error and any console output', async function () {
          await project.setConfig({
            rules: {
              'no-bare-strings': true,
            },
          });
          await project.write({
            app: {
              templates: {
                'application.hbs': '<h2>Here too!!</h2> <div>Bare strings are bad...</div>',
                components: {
                  'foo.hbs': '{{fooData}}',
                },
              },
            },
            'other-file.js': "module.exports = { rules: { 'no-bare-strings': false } };",
          });

          let result = await run(['.', '--config-path', project.path('other-file.js')]);

          expect(result.exitCode).toEqual(0);
          expect(result.stdout).toBeFalsy();
          expect(result.stderr).toBeFalsy();
        });
      });
    });

    describe('with --max-warnings param', function () {
      it('should exit with error if warning count is greater than max-warnings', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': 'warn',
            'no-html-comments': 'warn',
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
          },
        });

        let result = await run(['.', '--max-warnings=2']);

        expect(result.exitCode).toEqual(1);
        expect(result.stderr).toBeFalsy();
      });

      it('should exit without error if warning count is less or equal to max-warnings', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': 'warn',
            'no-html-comments': 'warn',
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
          },
        });

        let result = await run(['.', '--max-warnings=3']);

        expect(result.exitCode).toEqual(0);
        expect(result.stderr).toBeFalsy();
        expect(result.stdout.split('\n')).toEqual([
          'app/templates/application.hbs',
          '  1:4  warning  Non-translated string used  no-bare-strings',
          '  1:24  warning  Non-translated string used  no-bare-strings',
          '  1:53  warning  HTML comment detected  no-html-comments',
          '',
          '✖ 3 problems (0 errors, 3 warnings)',
        ]);
      });

      it('should exit with error if error count is greater than zero regardless of max-warnings', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': 'warn',
            'no-html-comments': 'error',
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
          },
        });

        let result = await run(['.', '--max-warnings=1000']);

        expect(result.exitCode).toEqual(1);
        expect(result.stderr).toMatchInlineSnapshot('""');
      });
    });

    describe('with --print-config option', function () {
      it('should error if more than one file passed to --print-config', async function () {
        await project.write({
          app: {
            templates: {
              components: {
                'foo.hbs': '{{fooData}}',
                'bar.hbs': '{{barData}}',
              },
            },
          },
        });

        let result = await run([
          'app/templates/components/foo.hbs',
          'app/templates/components/bar.hbs',
          '--print-config',
        ]);

        expect(result.exitCode).toEqual(1);
        expect(result.stderr).toMatchInlineSnapshot(
          `"The --print-config option must be used with exactly one file name."`
        );
      });

      it('should print config for file', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': 'warn',
            'no-html-comments': 'error',
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs':
                '<h2>Here too!!</h2><div>Bare strings are bad...</div><!-- bad html comment! -->',
            },
          },
        });

        let result = await run(['app/templates/application.hbs', '--print-config']);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toMatchInlineSnapshot(`
          "{
            \\"rules\\": {
              \\"no-bare-strings\\": {
                \\"config\\": true,
                \\"severity\\": 1
              },
              \\"no-html-comments\\": {
                \\"config\\": true,
                \\"severity\\": 2
              }
            },
            \\"overrides\\": [],
            \\"ignore\\": [],
            \\"format\\": {},
            \\"plugins\\": {},
            \\"loadedRules\\": {}
          }"
        `);
      });
    });

    describe('with --max-warnings and --quiet param', function () {
      it('should exit without error if warning count is more than max-warnings', async function () {
        await project.setConfig({
          rules: {
            'no-bare-strings': 'warn',
          },
        });
        await project.write({
          app: {
            templates: {
              'application.hbs': '<h2>Here too!!</h2><div>Bare strings are bad...</div>',
            },
          },
        });

        let result = await run(['.', '--max-warnings=1', '--quiet']);

        expect(result.exitCode).toEqual(0);
        expect(result.stdout).toMatchInlineSnapshot('""');
        expect(result.stderr).toMatchInlineSnapshot('""');
      });
    });
  });

  describe('autofixing files', function () {
    it('should write fixed file to fs', async function () {
      let config = { rules: { 'require-button-type': true } };
      await project.setConfig(config);
      await project.write({ 'require-button-type.hbs': '<button>Klikk</button>' });

      let result = await run(['.', '--fix']);

      expect(result.exitCode).toEqual(0);
      expect(result.stdout).toBeFalsy();
      expect(result.stderr).toBeFalsy();

      let fileContents = fs.readFileSync(project.path('require-button-type.hbs'), {
        encoding: 'utf8',
      });

      expect(fileContents).toEqual('<button type="button">Klikk</button>');
    });
  });
});
