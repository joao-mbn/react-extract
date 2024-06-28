# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [0.9.0] - 2024-06-28

### Added

- Configuration option for inline props type declaration.
- Configuration option for keeping props undestructured.

### Fixed

- Description for "Explicit Return Statement" configuration.

## [0.8.1] - 2024-05-18

### Fixed

- Mismatch between explicitReturnStatement config property name and searched key.

## [0.8.0] - 2024-05-18

### Added

- Configuration option for declaring component using React.FC
- Configuration option for declaring arrow functions with explicit return statement.

## [0.7.4] - 2024-04-23

### Fixed

- Variables at file scope being passed as props.
- Imported variables and variables at file scope being passed as shorthand props.

## [0.7.3] - 2024-03-31

### Fixed

- Shorthand variables declared within selection being passed as props.

## [0.7.2] - 2024-03-26

### Fixed

- d.ts files not being shipped in the VSIX

## [0.7.1] - 2024-03-24

### Fixed

- Typescript program not able to find global and derived types when bundled.

## [0.7.0] - 2024-03-16

### Added

- Wraps selection in React Fragments if a zero or more than one parent element is present.

## [0.6.0] - 2024-03-09

### Added

- Configuration option for declaring type as either interface or type.
- Configuration option for declaring function as either named function or arrow function.

### Fixed

- Default types from destructured and spread props from object binding typed as any
- Interface extending single spread props but with no other props adding a semi-colon inside the curly brackets.

## [0.5.0] - 2024-03-03

### Changed

- Category in Extension Manifest
- Extension colors to match those of the latest react version
- Demo gif

## [0.4.0] - 2024-03-02

### Added

- Some support to prop types for props whose type is long and gets truncated

### Fixed

- Prop types for props passed from function parameters
- Prop types for props passed from array destructuring
- Prop types for props passed from nested object destructuring

## [0.3.1] - 2024-02-28

### Fixed

- Passing methods and properties of class instances

## [0.3.0] - 2024-02-27

### Added

- Input treatment to the name given to the component

## [0.2.1] - 2024-02-26

### Fixed

- Props passed as short-hand assignments not being extracted into new component

## [0.2.0] - 2024-02-25

### Added

- Extension Icon

## [0.1.0] - 2024-02-25

### Added

- Keywords at package.json
- Link to extension at VS Code marketplace at README
- This CHANGELOG

## [0.0.1] - 2024-02-25

### Added

- Initial release with the project's MVP

