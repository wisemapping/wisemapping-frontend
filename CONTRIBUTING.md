Thanks for your interest in contributing to wisemapping!

Hopefully this document will be improved over time and get to be a [complete CONTRIBUTING document](https://mozillascience.github.io/working-open-workshop/contributing/).

# Sending a Pull Request

1. Create a new branch from `develop`. Convention for branch names is `feature/*` or `bugfix/*`. Eg. `feature/add-contributing-docs`.
2. Make your changes and test them.
3. Run quality checks:
    - `yarn build`
    - `yarn lint`
    - `yarn test`
4. Push your changes, and check that the pipeline result is OK.
    - If the pipeline failed, spot the issue and fix it.
    - If the failure is while running the tests and some snapshot is not matching:
        - you can check the difference by downloading the artifacts from the pipeline
        - Please check out [README.md](./README.md#Image-Snapshot-Testing) section on Image Snapshot Testing
        - update snapshots with `docker-compose -f docker-compose.snapshots.update.yml up` and then push any image changes
5. Create the pull request
