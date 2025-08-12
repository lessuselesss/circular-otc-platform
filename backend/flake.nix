{
  description = "CIRX OTC Backend PHP Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # PHP with required extensions
        php = pkgs.php82.buildEnv {
          extensions = ({ enabled, all }: enabled ++ (with all; [
            bcmath
            curl
            dom
            fileinfo
            filter
            hash
            mbstring
            openssl
            pcre
            pdo
            pdo_mysql
            pdo_sqlite
            session
            tokenizer
            xml
            zip
            json
          ]));
        };

        # Custom PHP development script
        devScript = pkgs.writeScriptBin "dev-server" ''
          #!${pkgs.bash}/bin/bash
          echo "Starting CIRX OTC Backend Development Server..."
          echo "Server will be available at http://localhost:8080"
          cd "$(dirname "$0")"
          ${php}/bin/php -S localhost:8080 -t public
        '';

        # Test runner script
        testScript = pkgs.writeScriptBin "run-tests" ''
          #!${pkgs.bash}/bin/bash
          echo "Running PHPUnit tests..."
          cd "$(dirname "$0")"
          ${php}/bin/php vendor/bin/phpunit "$@"
        '';

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            php
            php82Packages.composer
            mysql80
            sqlite
            devScript
            testScript
            # Development tools
            phpunit
            # Database tools
            mysql-workbench
            # HTTP testing
            httpie
            curl
          ];

          shellHook = ''
            echo "🚀 CIRX OTC Backend Development Environment"
            echo "================================================="
            echo "PHP Version: $(php --version | head -n1)"
            echo "Composer Version: $(composer --version)"
            echo ""
            echo "Available commands:"
            echo "  composer install    - Install PHP dependencies"
            echo "  dev-server          - Start development server"
            echo "  run-tests           - Run PHPUnit tests"
            echo "  composer test       - Run tests via composer script"
            echo ""
            echo "Database commands:"
            echo "  mysql               - Connect to MySQL"
            echo "  sqlite3             - SQLite command line"
            echo ""
            
            # Set up environment
            export PHP_INI_DIR="${php}/etc"
            export COMPOSER_HOME="$PWD/.composer"
            
            # Create necessary directories
            mkdir -p storage/logs
            mkdir -p .composer
            
            echo "Ready for development! 🎯"
          '';
        };

        # Package for production builds
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "cirx-otc-backend";
          version = "1.0.0";
          
          src = ./.;
          
          buildInputs = [ php php82Packages.composer ];
          
          buildPhase = ''
            composer install --no-dev --optimize-autoloader
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r . $out/
          '';
        };

        # Development tools as apps
        apps = {
          dev-server = flake-utils.lib.mkApp {
            drv = devScript;
          };
          
          test = flake-utils.lib.mkApp {
            drv = testScript;
          };
          
          composer = flake-utils.lib.mkApp {
            drv = php82Packages.composer;
          };
        };
      });
}