import { useEffect, useRef, useState } from "react";
import {
  getSiteSettings,
  getStoredSiteSettings,
  normalizeSiteSettings,
  subscribeToSiteSettings,
} from "../utils/siteSettings";

const cloneExecutableNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || "");
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return document.createComment(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const isSvg = node.namespaceURI === "http://www.w3.org/2000/svg";
  const element = isSvg
    ? document.createElementNS(node.namespaceURI, node.tagName)
    : document.createElement(node.tagName);

  Array.from(node.attributes).forEach((attribute) => {
    element.setAttribute(attribute.name, attribute.value);
  });

  if (node.tagName.toLowerCase() === "script") {
    element.text = node.textContent || "";
    return element;
  }

  Array.from(node.childNodes).forEach((child) => {
    const clonedChild = cloneExecutableNode(child);
    if (clonedChild) {
      element.appendChild(clonedChild);
    }
  });

  return element;
};

const removeInjectedNodes = (nodes) => {
  nodes.forEach((node) => {
    if (node?.parentNode) {
      node.parentNode.removeChild(node);
    }
  });
};

const injectHtml = (slot, html, registryRef) => {
  removeInjectedNodes(registryRef.current[slot]);
  registryRef.current[slot] = [];

  if (!html || !html.trim()) {
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  const target = slot === "head" ? document.head : document.body;
  const nodes = Array.from(template.content.childNodes)
    .map((node) => cloneExecutableNode(node))
    .filter(Boolean);

  nodes.forEach((node) => {
    target.appendChild(node);
  });

  registryRef.current[slot] = nodes;
};

const CustomCodeInjector = () => {
  const [settings, setSettings] = useState(() => getStoredSiteSettings());
  const injectedNodesRef = useRef({
    head: [],
    footer: [],
  });

  useEffect(() => {
    let isMounted = true;
    const injectedNodes = injectedNodesRef.current;

    const loadSettings = async () => {
      const { settings: loadedSettings } = await getSiteSettings();

      if (isMounted) {
        setSettings(normalizeSiteSettings(loadedSettings));
      }
    };

    loadSettings();

    const unsubscribe = subscribeToSiteSettings((nextSettings) => {
      setSettings(normalizeSiteSettings(nextSettings));
    });

    return () => {
      isMounted = false;
      unsubscribe();
      removeInjectedNodes(injectedNodes.head);
      removeInjectedNodes(injectedNodes.footer);
    };
  }, []);

  useEffect(() => {
    const normalized = normalizeSiteSettings(settings);
    injectHtml("head", normalized.header_script, injectedNodesRef);
    injectHtml("footer", normalized.footer_script, injectedNodesRef);
  }, [settings]);

  return null;
};

export default CustomCodeInjector;
