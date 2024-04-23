import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { useRenderedTheme } from '../../model/rendered-theme';
import { EditorPanel } from '../editors/EditorPanel';
import { GridConfigDropdownButton } from '../grid-config/GridConfigDropdown';
import { PresetSelector } from '../presets/PresetSelector';
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeading,
    DialogTrigger,
} from './Dialog';
import { DownloadThemeButton } from './DownloadThemeButton';
import { GridPreview } from './GridPreview';

export const RootContainer = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOpen(true);
        });
        return () => clearTimeout(timeout);
    }, []);

    useRenderedTheme();
    return (
        <Container>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>My trigger</DialogTrigger>
                <DialogContent>
                    <DialogBody>
                        {' '}
                        <DialogHeading>Are you sure you want to reset? </DialogHeading>
                        <DialogDescription>
                            Applying a preset will reset any changes you've made to a theme. Changes will be lost.
                        </DialogDescription>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose>Cancel</DialogClose>
                        <button className="button-primary">Continue</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Menu>
                <EditorScroller>
                    <EditorPanel />
                </EditorScroller>
                <MenuBottom>
                    <DownloadThemeButton />
                    <GridConfigDropdownButton />
                </MenuBottom>
            </Menu>
            <Main>
                <PresetSelector />
                <GridPreview />
            </Main>
        </Container>
    );
};

const Container = styled('div')`
    width: 100%;
    height: calc(100vh - var(--header-nav-height) - 32px);
    min-height: 600px;
    margin-top: 16px;
    display: flex;

    font-family: -apple-system, BlinkMacSystemFont, 'IBM Plex Sans', sans-serif;

    .tooltip {
        max-width: 400px;
    }

    @media screen and (max-width: 800px) {
        display: none;
    }
`;

const EditorScroller = styled('div')`
    position: absolute;
    inset: 0 0 48px 0;
    overflow-y: auto;
`;

const Spacer = styled('div')`
    flex-grow: 1;
`;

const Menu = styled('div')`
    min-width: 300px;
    flex: 0;
    position: relative;
`;

const MenuBottom = styled('div')`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;

    &:after {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 12px;
        margin-top: -12px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, var(--color-bg-primary) 100%);
    }
`;

const Main = styled('div')`
    flex-grow: 1;
    min-width: 0;
    grid-area: main;
    padding-left: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 20px;
`;
