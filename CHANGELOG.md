# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

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
